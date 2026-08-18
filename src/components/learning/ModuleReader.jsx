import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Clock, CheckCircle2, Sparkles, Sun, Moon, ArrowRight } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import CheckpointCard from './CheckpointCard';
import VideoCard from './VideoCard';
import LetterSoundGrid from './LetterSoundGrid';
import StreakChip from './StreakChip';
import { H2Renderer, H3Renderer } from './ModuleHeadings';
import { useAccessibility } from '@/hooks/useAccessibility';
import { useGamification } from '@/hooks/useGamification';

const STORAGE_PREFIX = 'nlb_module_progress_';

function loadProgress(moduleId) {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + moduleId);
    return raw ? JSON.parse(raw) : { answered: {}, correct: {}, practiceLaunched: false };
  } catch {
    return { answered: {}, correct: {}, practiceLaunched: false };
  }
}

function saveProgress(moduleId, data) {
  try {
    localStorage.setItem(STORAGE_PREFIX + moduleId, JSON.stringify(data));
  } catch {
    // ignore
  }
}

function clearProgress(moduleId) {
  try {
    localStorage.removeItem(STORAGE_PREFIX + moduleId);
  } catch {
    // ignore
  }
}

function splitTextByH2(text) {
  const regex = /^## (.+)$/gm;
  const matches = [...text.matchAll(regex)];
  if (matches.length === 0) return [{ heading: null, content: text }];
  const parts = [];
  if (matches[0].index > 0) {
    parts.push({ heading: null, content: text.slice(0, matches[0].index) });
  }
  for (let i = 0; i < matches.length; i++) {
    const m = matches[i];
    const start = m.index;
    const end = i + 1 < matches.length ? matches[i + 1].index : text.length;
    parts.push({ heading: m[1].trim(), content: text.slice(start, end) });
  }
  return parts;
}

function buildBlocks(content, checkpoints) {
  const rawTokens = [];
  const regex = /\{\{CHECKPOINT\}\}|\{\{VIDEO:([^}]*)\}\}|\{\{LETTER_CARDS:([^}]*)\}\}/g;
  let lastIndex = 0;
  let checkpointIndex = 0;
  let match;
  while ((match = regex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      rawTokens.push({ type: 'text', content: content.slice(lastIndex, match.index) });
    }
    if (match[0] === '{{CHECKPOINT}}') {
      if (checkpoints[checkpointIndex]) {
        rawTokens.push({ type: 'checkpoint', index: checkpointIndex, checkpoint: checkpoints[checkpointIndex] });
      }
      checkpointIndex++;
    } else if (match[1] !== undefined) {
      const p = match[1].split('|').map((s) => (s || '').trim());
      rawTokens.push({
        type: 'video',
        videoId: p[0] || '',
        title: p[1] || 'Instructional video',
        description: p[2] || '',
        start: p[3] || '',
        end: p[4] || '',
      });
    } else if (match[2] !== undefined) {
      const cards = match[2].split('|').map((pair) => {
        const [letter, word] = pair.split(',').map((s) => (s || '').trim());
        return { letter, word };
      });
      rawTokens.push({ type: 'letter_cards', cards });
    }
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < content.length) {
    rawTokens.push({ type: 'text', content: content.slice(lastIndex) });
  }

  const blocks = [];
  let currentSection = null;

  const flushSection = () => {
    if (currentSection) {
      blocks.push(currentSection);
      currentSection = null;
    }
  };

  for (const tok of rawTokens) {
    if (tok.type === 'text') {
      const parts = splitTextByH2(tok.content);
      for (const part of parts) {
        if (part.heading) {
          flushSection();
          currentSection = { type: 'section', title: part.heading, children: [] };
          if (part.content) currentSection.children.push({ type: 'text', content: part.content });
        } else {
          if (!currentSection) {
            currentSection = { type: 'section', title: null, children: [] };
          }
          if (part.content) currentSection.children.push({ type: 'text', content: part.content });
        }
      }
    } else if (tok.type === 'video') {
      if (!currentSection) currentSection = { type: 'section', title: null, children: [] };
      currentSection.children.push(tok);
    } else if (tok.type === 'checkpoint') {
      flushSection();
      blocks.push({ type: 'checkpoint', index: tok.index, checkpoint: tok.checkpoint });
    } else if (tok.type === 'letter_cards') {
      flushSection();
      blocks.push({ type: 'letter_cards', cards: tok.cards });
    }
  }
  flushSection();
  return blocks;
}

export default function ModuleReader({
  module,
  onComplete,
  onBack,
  trackModules = [],
  progress = {},
  onSwitchModule,
}) {
  const navigate = useNavigate();
  const { prefs, toggleTheme } = useAccessibility();
  const { stats, recordAnswer, awardBadge } = useGamification();
  const checkpoints = useMemo(() => module.checkpoints || [], [module.checkpoints]);
  const hasLetterCards = !!module.content?.includes('{{LETTER_CARDS');
  const isIntro = checkpoints.length === 0 && !module.practice_prompt && !hasLetterCards;
  const isReference = checkpoints.length === 0 && !module.practice_prompt && hasLetterCards;
  const [saved, setSaved] = useState(() => loadProgress(module.id));
  const completedRef = useRef(false);

  const blocks = useMemo(() => buildBlocks(module.content, checkpoints), [module.content, checkpoints]);

  useEffect(() => {
    setSaved(loadProgress(module.id));
    completedRef.current = false;
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [module.id]);

  const answeredCount = Object.keys(saved.answered).length;
  const noProgress = isIntro || isReference;
  const totalSteps = noProgress ? 0 : checkpoints.length + 1;
  const doneSteps = noProgress ? 0 : answeredCount + (saved.practiceLaunched ? 1 : 0);
  const allDone = noProgress ? false : answeredCount === checkpoints.length && saved.practiceLaunched;
  const pct = noProgress || totalSteps === 0 ? 0 : Math.round((doneSteps / totalSteps) * 100);

  const handleAnswered = (checkIndex, selectedIndex, isCorrect) => {
    setSaved((prev) => {
      if (prev.answered[checkIndex] !== undefined) return prev;
      const next = {
        ...prev,
        answered: { ...prev.answered, [checkIndex]: selectedIndex },
        correct: { ...prev.correct, [checkIndex]: !!isCorrect },
      };
      saveProgress(module.id, next);
      return next;
    });
    recordAnswer(isCorrect);
  };

  const handlePractice = () => {
    const willComplete = answeredCount === checkpoints.length && !saved.practiceLaunched;
    const allCorrect =
      Object.keys(saved.correct).length === checkpoints.length && Object.values(saved.correct).every(Boolean);
    const next = { ...saved, practiceLaunched: true };
    saveProgress(module.id, next);
    setSaved(next);
    if (willComplete) {
      completedRef.current = true;
      if (allCorrect) awardBadge('perfect_module');
      clearProgress(module.id);
      onComplete(module);
    }
    navigate('/coach', {
      state: {
        practiceContext: {
          mode: 'guided_roleplay',
          title: module.title,
          scenario_prompt: module.practice_prompt,
          module_id: module.id,
          segment: module.segment,
        },
      },
    });
  };

  const handleContinueIntro = () => {
    if (!completedRef.current) {
      completedRef.current = true;
      onComplete(module);
    }
    const sorted = trackModules.slice().sort((a, b) => a.order - b.order);
    const next = sorted.find((m) => m.order > module.order);
    if (next) onSwitchModule(next);
    else onBack();
  };

  useEffect(() => {
    if (allDone && !completedRef.current) {
      completedRef.current = true;
      const allCorrect = Object.values(saved.correct).every(Boolean);
      if (allCorrect) awardBadge('perfect_module');
      clearProgress(module.id);
      onComplete(module);
    }
  }, [allDone, module, onComplete, saved.correct, awardBadge]);

  const nextModule = useMemo(() => {
    const sorted = trackModules.slice().sort((a, b) => a.order - b.order);
    return sorted.find((m) => m.order > module.order);
  }, [trackModules, module.order]);

  return (
    <div className="px-4 md:px-8 py-6 md:py-8 pb-24 md:pb-12">
      {/* Top bar: back + theme toggle */}
      <div className="max-w-2xl mx-auto flex items-center justify-between mb-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to modules
        </button>
        <button
          onClick={toggleTheme}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
          aria-label="Toggle theme"
        >
          {prefs.theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          {prefs.theme === 'dark' ? 'Light' : 'Dark'}
        </button>
      </div>

      <article className="max-w-2xl mx-auto">
        {/* Micro-progress bar (hidden for intro & reference modules) */}
        {!noProgress && (
          <div className="sticky top-2 z-10 mb-6 rounded-xl bg-card/80 backdrop-blur border border-border/60 px-4 py-2.5">
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium text-muted-foreground">
                    {doneSteps} of {totalSteps} steps
                  </span>
                  <span className="text-sm font-semibold text-foreground">{pct}%</span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
              <StreakChip streak={stats.quiz_current_streak} />
              {allDone && (
                <span className="flex items-center gap-1 text-sm font-medium text-emerald-600">
                  <CheckCircle2 className="w-4 h-4" /> Done
                </span>
              )}
            </div>
          </div>
        )}

        {/* Header */}
        <header className="mb-8">
          <span className="inline-block px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-3">
            {module.category}
          </span>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">{module.title}</h1>
          <p className="text-base text-muted-foreground">{module.description}</p>
          {module.duration_minutes && (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-3">
              <Clock className="w-4 h-4" />
              {module.duration_minutes} min read
            </div>
          )}
        </header>

        {/* Content */}
        <div className="space-y-1">
          {blocks.map((block, i) => {
            if (block.type === 'section') {
              return (
                <section key={i}>
                  {block.children.map((child, j) => {
                    if (child.type === 'text') {
                      return (
                        <div key={j} className="reader-prose">
                          <ReactMarkdown components={{ h2: H2Renderer, h3: H3Renderer }}>{child.content}</ReactMarkdown>
                        </div>
                      );
                    }
                    return (
                      <VideoCard
                        key={j}
                        videoId={child.videoId}
                        title={child.title}
                        description={child.description}
                        start={child.start}
                        end={child.end}
                      />
                    );
                  })}
                </section>
              );
            }
            if (block.type === 'checkpoint') {
              return (
                <div key={i}>
                  <CheckpointCard
                    checkpoint={block.checkpoint}
                    index={block.index + 1}
                    initialSelected={
                      saved.answered[block.index] !== undefined ? saved.answered[block.index] : null
                    }
                    onAnswered={handleAnswered}
                  />
                </div>
              );
            }
            if (block.type === 'letter_cards') {
              return <LetterSoundGrid key={i} cards={block.cards} />;
            }
            return null;
          })}
        </div>

        {/* Intro module: Continue CTA */}
        {isIntro && (
          <div className="mt-8 rounded-2xl bg-primary/5 border border-primary/15 p-5 md:p-6 text-center">
            <div className="w-11 h-11 rounded-full bg-primary/15 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold">Ready to start?</h3>
            <p className="text-sm text-muted-foreground mt-1 mb-4">
              {nextModule
                ? `Continue to "${nextModule.title}" to begin building your skills.`
                : "You've reached the end of this introduction."}
            </p>
            <Button size="lg" className="h-11" onClick={handleContinueIntro}>
              {nextModule ? `Continue to ${nextModule.title}` : 'Back to modules'}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}

        {/* Reference module (letter sounds etc.): simple continue CTA */}
        {isReference && (
          <div className="mt-8 rounded-2xl bg-primary/5 border border-primary/15 p-5 md:p-6 text-center">
            <div className="w-11 h-11 rounded-full bg-primary/15 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold">Nice work!</h3>
            <p className="text-sm text-muted-foreground mt-1 mb-4">
              {nextModule ? 'Keep going to learn the next set of sounds.' : "You've reached the end of this section."}
            </p>
            <Button size="lg" className="h-11" onClick={handleContinueIntro}>
              {nextModule ? `Continue to ${nextModule.title}` : 'Back to modules'}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}

        {!noProgress && (
          <>
            {/* Practice CTA */}
            <div className="mt-8 rounded-2xl bg-primary/5 border border-primary/15 p-5 md:p-6">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base font-semibold">Practise with the AI Coach</h3>
                    {saved.practiceLaunched && (
                      <span className="inline-flex items-center gap-1 text-sm font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="w-4 h-4" /> Done
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Build confidence by practising this scenario — the AI will describe how a child
                    might respond, so you can rehearse your approach before your real session.
                  </p>
                </div>
              </div>
              <Button size="lg" className="w-full h-11" onClick={handlePractice}>
                <Sparkles className="w-4 h-4 mr-2" />
                {saved.practiceLaunched ? 'Practise again' : 'Practise this scenario'}
              </Button>
            </div>

            {/* Completion / hint */}
            {allDone ? (
              <div className="mt-6 rounded-2xl bg-emerald-50 border border-emerald-200 p-5 text-center">
                <div className="w-11 h-11 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-2">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                </div>
                <h3 className="text-lg font-semibold text-emerald-800">Module completed!</h3>
                <p className="text-sm text-emerald-700 mt-1">
                  You've finished all pop quizzes and the practice session. Your progress has been saved.
                </p>
                <div className="mt-4 flex flex-col sm:flex-row gap-2 justify-center">
                  {nextModule && (
                    <Button className="h-11" onClick={() => onSwitchModule(nextModule)}>
                      Continue to {nextModule.title}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  )}
                  <Button variant="outline" className="h-11" onClick={onBack}>
                    Back to modules
                  </Button>
                </div>
              </div>
            ) : (
              <p className="mt-6 text-sm text-muted-foreground text-center">
                This module completes automatically once you answer all pop quizzes and launch the
                practice session.
              </p>
            )}
          </>
        )}
      </article>
    </div>
  );
}