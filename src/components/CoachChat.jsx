import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Send, Loader2, MessageCircle, Sparkles } from 'lucide-react';

export default function CoachChat() {
  const location = useLocation();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [assessmentContext, setAssessmentContext] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (location.state?.assessmentContext) {
      setAssessmentContext(location.state.assessmentContext);
      const ctx = location.state.assessmentContext;
      setMessages([
        {
          role: 'assistant',
          content: `Hello! I see you've just completed a ${ctx.test_type === 'pre' ? 'pre' : 'post'}-test assessment for ${ctx.child_name} from ${ctx.club_name}. The child scored ${ctx.total_score}/${ctx.total_possible} and is at ${ctx.proficiency_level}. The areas needing support are: ${ctx.competencies_needing_help?.join(', ') || 'none'}.\n\nI'm here to help you with personalised coaching strategies. What would you like to work on with ${ctx.child_name}?`,
        },
      ]);
    } else {
      setMessages([
        {
          role: 'assistant',
          content: "Hello! I'm your AI Learning Coach. I'm here to help you with personalised strategies for supporting children in the kidsREAD reading program.\n\nYou can ask me about:\n• How to teach specific letter sounds or blending\n• Strategies for struggling readers\n• Activities and games for reading practice\n• How to use assessment results to guide your coaching\n\nWhat would you like help with today?",
        },
      ]);
    }
  }, [location.state]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMessage = { role: 'user', content: input.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    try {
      const response = await base44.functions.invoke('chatWithCoach', {
        message: userMessage.content,
        conversation_history: messages,
        assessment_context: assessmentContext,
      });
      setMessages((prev) => [...prev, { role: 'assistant', content: response.data.response }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: "I'm sorry, I had trouble responding just now. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] md:h-screen max-w-3xl mx-auto">
      {/* Header */}
      <div className="px-4 py-4 border-b border-border bg-card/50 backdrop-blur sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold">AI Learning Coach</h1>
            <p className="text-sm text-muted-foreground">
              {assessmentContext
                ? `Coaching for ${assessmentContext.child_name}`
                : 'Personalised guidance for reading champions'}
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 pb-4">
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
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-4 border-t border-border bg-card">
        <div className="flex gap-2 items-end">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask for coaching strategies, activities, or guidance..."
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