import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Send, Loader2, Sparkles, ShieldAlert, GraduationCap, MessageCircle, ArrowLeft, History } from 'lucide-react';
import { pickName, pickNames } from '@/lib/namePool';
import ConversationHistory from '@/components/coach/ConversationHistory';
import { addCoachSession, addCoachMessage, getCoachConversation } from '@/lib/localStore';

export default function CoachChat() {
  const location = useLocation();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [assessmentContext, setAssessmentContext] = useState(null);
  const [practiceContext, setPracticeContext] = useState(null);
  const [mode, setMode] = useState('coach');
  const [sessionId, setSessionId] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const prevLengthRef = useRef(0);
  const bootstrappedRef = useRef(false);
  const lastNameRef = useRef(null);

  useEffect(() => {
    if (location.state?.assessmentContext) {
      setAssessmentContext(location.state.assessmentContext);
      setMode('coach');
      const ctx = location.state.assessmentContext;
      setMessages([
        {
          role: 'assistant',
          content: `I see you've just completed a ${ctx.test_type === 'pre' ? 'pre' : 'post'}-test for ${ctx.child_name} from ${ctx.club_name}. They scored ${ctx.total_score}/${ctx.total_possible} (${ctx.proficiency_level}). Areas needing support: ${ctx.competencies_needing_help?.join(', ') || 'none'}.\n\nWhat would you like to work on with ${ctx.child_name}?`,
        },
      ]);
    } else if (location.state?.practiceContext) {
      startGuidedPractice(location.state.practiceContext);
    }
  }, [location.state]);

  useEffect(() => {
    const prevLen = prevLengthRef.current;
    prevLengthRef.current = messages.length;
    // Fresh guided-practice opening: scroll to the top so the scene is read from the start.
    if (mode === 'guided_roleplay' && prevLen === 0 && messages.length === 1) {
      messagesContainerRef.current?.scrollTo({ top: 0, behavior: 'auto' });
    } else {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, mode]);

  const ensureSession = (type, title, context) => {
    if (sessionId) return sessionId;
    const s = addCoachSession({ title, type, context });
    setSessionId(s.id);
    // Persist any seed messages already in the UI
    messages.forEach((m) => addCoachMessage(s.id, m));
    return s.id;
  };

  const startGuidedPractice = (rawCtx) => {
    // Pick a fresh name (or names for group scenarios), avoiding the last-used.
    const isGroup = rawCtx.segment === 'storytelling';
    const enrichedCtx = { ...rawCtx };
    if (isGroup) {
      const names = pickNames(3, lastNameRef.current);
      enrichedCtx.child_names = names;
      lastNameRef.current = names[0];
    } else {
      const name = pickName(lastNameRef.current);
      enrichedCtx.child_name = name;
      lastNameRef.current = name;
    }
    setPracticeContext(enrichedCtx);
    setMode('guided_roleplay');
    if (!bootstrappedRef.current) {
      bootstrappedRef.current = true;
      setLoading(true);
      (async () => {
        try {
          const response = await base44.functions.invoke('chatWithCoach', {
            message: "Let's begin the guided practice. Please describe the setting and the child, then ask me what I would do first.",
            conversation_history: [],
            practice_context: enrichedCtx,
          });
          const assistantMessage = { role: 'assistant', content: response.data.response };
          const s = addCoachSession({
            title: enrichedCtx.title || 'Guided practice',
            type: 'guided_practice',
            context: enrichedCtx,
          });
          setSessionId(s.id);
          addCoachMessage(s.id, assistantMessage);
          setMessages([assistantMessage]);
        } catch (err) {
          setMessages([
            { role: 'assistant', content: "I'm ready to guide your practice. Tell me what you'd like to practise and I'll set the scene." },
          ]);
        } finally {
          setLoading(false);
        }
      })();
    }
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMessage = { role: 'user', content: input.trim() };

    let type = 'coach';
    let title = userMessage.content.length > 40 ? userMessage.content.slice(0, 40).trim() + '…' : userMessage.content;
    let context = null;
    if (practiceContext) {
      type = 'guided_practice';
      title = practiceContext.title || 'Guided practice';
      context = practiceContext;
    } else if (assessmentContext) {
      type = 'assessment_coaching';
      title = `Coaching for ${assessmentContext.child_name || 'child'}`;
      context = assessmentContext;
    }
    const sid = ensureSession(type, title, context);
    addCoachMessage(sid, userMessage);

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    try {
      const response = await base44.functions.invoke('chatWithCoach', {
        message: userMessage.content,
        conversation_history: messages,
        assessment_context: assessmentContext,
        practice_context: practiceContext,
      });
      const assistantMessage = { role: 'assistant', content: response.data.response };
      addCoachMessage(sid, assistantMessage);
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      const errMsg = { role: 'assistant', content: "I'm sorry, I had trouble responding just now. Please try again." };
      addCoachMessage(sid, errMsg);
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenSession = (session) => {
    setShowHistory(false);
    const convo = getCoachConversation(session.id);
    setMessages(convo.map((m) => ({ role: m.role, content: m.content })));
    setSessionId(session.id);
    if (session.type === 'guided_practice') {
      setMode('guided_roleplay');
      setPracticeContext(session.context || null);
      setAssessmentContext(null);
    } else if (session.type === 'assessment_coaching') {
      setMode('coach');
      setAssessmentContext(session.context || null);
      setPracticeContext(null);
    } else {
      setMode('coach');
      setAssessmentContext(null);
      setPracticeContext(null);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const showEmptyState = messages.length === 0 && !loading && mode === 'coach' && !assessmentContext;

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem-5.5rem)] md:h-screen max-w-3xl mx-auto">
      {/* Header */}
      <div className="px-4 md:px-6 py-3 border-b border-border bg-card/60 backdrop-blur sticky top-0 z-10">
        <div className="flex items-center gap-3">
          {practiceContext?.module_id && (
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground -ml-2"
              onClick={() =>
                navigate('/learning', {
                  state: { reopenModuleId: practiceContext.module_id, segment: practiceContext.segment },
                })
              }
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to module
            </Button>
          )}
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
            {mode === 'guided_roleplay' ? (
              <GraduationCap className="w-5 h-5 text-primary" />
            ) : (
              <Sparkles className="w-5 h-5 text-primary" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-lg font-semibold truncate">
              {mode === 'guided_roleplay' ? 'Guided Practice' : 'kidsREAD Volunteer Coach'}
            </h1>
            <p className="text-sm text-muted-foreground truncate">
              {mode === 'guided_roleplay'
                ? practiceContext?.title || 'Scenario practice'
                : assessmentContext
                ? `Coaching for ${assessmentContext.child_name}`
                : 'Teaching, storytelling & programme guidance'}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="ml-auto shrink-0 md:px-3"
            onClick={() => setShowHistory(true)}
          >
            <History className="w-4 h-4 md:mr-2" />
            <span className="hidden md:inline">Past conversations</span>
          </Button>
        </div>
      </div>
      {showHistory && (
        <ConversationHistory
          onClose={() => setShowHistory(false)}
          onSelect={handleOpenSession}
        />
      )}

      {/* Messages / Empty state */}
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4 pb-4">
        {showEmptyState ? (
          <div className="max-w-xl mx-auto space-y-4 pt-4">
            <div className="rounded-2xl border border-border bg-card p-6">
              <div className="flex items-center gap-2 mb-3">
                <MessageCircle className="w-4 h-4 text-primary" />
                <h2 className="text-base font-semibold">How I can help</h2>
              </div>
              <p className="text-sm text-muted-foreground mb-3">Ask me anything about:</p>
              <ul className="text-sm text-foreground space-y-1.5">
                <li>• Building reading confidence &amp; early reading skills (letter sounds, blending, tricky words)</li>
                <li>• Storytelling and reading aloud techniques</li>
                <li>• Facilitating sessions and managing group behaviour</li>
                <li>• Routine kidsREAD programme matters</li>
              </ul>
            </div>
            <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-5">
              <div className="flex items-center gap-2 mb-2">
                <ShieldAlert className="w-4 h-4 text-amber-600" />
                <h2 className="text-sm font-semibold text-amber-800">Sensitive matters</h2>
              </div>
              <p className="text-sm text-amber-800/90">
                I can't advise on safeguarding, safety, privacy, sensitive family circumstances, or
                complaints. If you raise something like that, I'll direct you to the kidsREAD team at{' '}
                <span className="font-medium">kidsread@nlb.gov.sg</span> — please don't investigate or
                make promises to the child.
              </p>
            </div>
            <Button
              variant="outline"
              className="w-full h-12"
              onClick={() =>
                startGuidedPractice({
                  mode: 'guided_roleplay',
                  title: 'Guided practice',
                  scenario_prompt:
                    'A general kidsREAD reading session. The volunteer wants to practise guiding a child through a reading activity. Help them rehearse their approach step by step.',
                })
              }
            >
              <GraduationCap className="w-4 h-4 mr-2" />
              Start a guided practice
            </Button>
          </div>
        ) : (
          <>
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground rounded-br-md'
                      : 'bg-card border border-border rounded-bl-md'
                  }`}
                >
                  <p className="text-base whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-card border border-border rounded-2xl rounded-bl-md px-4 py-3">
                  <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
                </div>
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-4 pt-4 pb-4 border-t border-border bg-card">
        <div className="flex gap-2 items-end">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              mode === 'guided_roleplay'
                ? 'Describe what you would do or say...'
                : 'Ask about teaching, storytelling, or your session...'
            }
            rows={1}
            className="flex-1 resize-none rounded-xl border border-input bg-background px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-ring min-h-[52px] max-h-32"
            disabled={loading}
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            size="lg"
            className="h-[52px] w-[52px] p-0 shrink-0"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}