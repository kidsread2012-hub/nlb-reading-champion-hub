import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Clock, CheckCircle2, Sparkles, LayoutGrid, Sun, Moon } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import CheckpointCard from './CheckpointCard';
import VideoCard from './VideoCard';
import ProgressTree from './ProgressTree';
import { useAccessibility } from '@/hooks/useAccessibility';

const STORAGE_PREFIX = 'nlb_module_progress_';

function loadProgress(moduleId) {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + moduleId);
    return raw ? JSON.parse(raw) : { answered: {}, practiceLaunched: false };
  } catch {
    return { answered: {}, practiceLaunched: false };
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
  const checkpoints = module.checkpoints || [];
  const [saved, setSaved] = useState(() => loadProgress(module.id));
  const completedRef = useRef(false);

  const tokens = React.useMemo(() => {
    const result = [];
    const regex = /\{\{CHECKPOINT\}\}|\{\{VIDEO:([^}]*)\}\}/g;
    let lastIndex = 0;
    let checkpointIndex = 0;
    let match;
    while ((match = regex.exec(module.content)) !== null) {
      if (match.index > lastIndex) {
        result.push({ type: 'text', content: module.content.slice(lastIndex, match.index) });
      }
      if (match[0] === '{{CHECKPOINT}}') {
        if (checkpoints[checkpointIndex]) {
          result.push({
            type: 'checkpoint',
            index: checkpointIndex,
            checkpoint: checkpoints[checkpointIndex],
          });
        }
        checkpointIndex++;
      } else {
        const p = match[1].split('|').map((s) => (s || '').trim());
        result.push({
          type: 'video',
          videoId: p[0] || '',
          title: p[1] || 'Instructional video',
          description: p[2] || '',
          start: p[3] || '',
          end: p[4] || '',
        });
      }
      lastIndex = regex.lastIndex;
    }
    if (lastIndex < module.content.length) {
      result.push({ type: 'text', content: module.content.slice(lastIndex) });
    }
    return result;
  }, [module]);

  const answeredCount = Object.keys(saved.answered).length;
  const totalSteps = checkpoints.length + 1;
  const doneSteps = answeredCount + (saved.practiceLaunched ? 1 : 0);
  const allDone = answeredCount === checkpoints.length && saved.practiceLaunched;
  const pct = Math.round((doneSteps / totalSteps) * 100);

  const handleAnswered = (checkIndex, selectedIndex) => {
    setSaved((prev) => {
      if (prev.answered[checkIndex] !== undefined) return prev;
      const next = { ...prev, answered: { ...prev.answered, [checkIndex]: selectedIndex } };
      saveProgress(module.id, next);
      return next;
    });
  };

  const handlePractice = () => {
    const willComplete = answeredCount === checkpoints.length && !saved.practiceLaunched;
    const next = { ...saved, practiceLaunched: true };
    saveProgress(module.id, next);
    setSaved(next);
    if (willComplete) {
      completedRef.current = true;
      clearProgress(module.id);
      onComplete(module);
    }
    navigate('/coach', {
      state: {
        practiceContext: {
          title: module.title,
          scenario_prompt: module.practice_prompt,
          child_age: '5',
        },
      },
    });
  };

  // Auto-complete when the final check-in is answered (practice already done)
  useEffect(() => {
    if (allDone && !completedRef.current) {
      completedRef.current = true;
      clearProgress(module.id);
      onComplete(module);
    }
  }, [allDone, module, onComplete]);

  return (
    <div className="px-4 md:px-8 py-6 md:py-8 pb-24 md:pb-12">
      {/* Top bar: back + theme toggle */}
      <div className="max-w-5xl mx-auto flex items-center justify-between mb-4">
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

      <div className="max-w-5xl mx-auto flex gap-8">
        <ProgressTree
          module={module}
          checkpoints={checkpoints}
          answered={saved.answered}
          practiceLaunched={saved.practiceLaunched}
          trackModules={trackModules}
          progress={progress}
          onSwitchModule={onSwitchModule}
        />

        {/* Center content */}
        <article className="flex-1 min-w-0">
          {/* Micro-progress bar */}
          <div className="sticky top-2 z-10 mb-6 rounded-xl bg-card/80 backdrop-blur border border-border/60 px-4 py-2.5">
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-medium text-muted-foreground">
                    {doneSteps} of {totalSteps} steps
                  </span>
                  <span className="text-xs font-semibold text-foreground">{pct}%</span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
              {allDone && (
                <span className="flex items-center gap-1 text-xs font-medium text-emerald-600">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Done
                </span>
              )}
            </div>
          </div>

          {/* Header */}
          <header className="mb-8">
            <span className="inline-block px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium mb-3">
              {module.category}
            </span>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">{module.title}</h1>
            <p className="text-base text-muted-foreground max-w-[65ch]">{module.description}</p>
            {module.duration_minutes && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-3">
                <Clock className="w-3.5 h-3.5" />
                {module.duration_minutes} min read
              </div>
            )}
          </header>

          {/* Content */}
          <div className="max-w-[65ch] space-y-1">
            {tokens.map((tok, i) => {
              if (tok.type === 'text') {
                return (
                  <div key={i} className="reader-prose">
                    <ReactMarkdown>{tok.content}</ReactMarkdown>
                  </div>
                );
              }
              if (tok.type === 'checkpoint') {
                const ci = tok.index;
                return (
                  <CheckpointCard
                    key={i}
                    checkpoint={tok.checkpoint}
                    index={ci + 1}
                    initialSelected={saved.answered[ci] !== undefined ? saved.answered[ci] : null}
                    onAnswered={handleAnswered}
                  />
                );
              }
              return (
                <VideoCard
                  key={i}
                  videoId={tok.videoId}
                  title={tok.title}
                  description={tok.description}
                  start={tok.start}
                  end={tok.end}
                />
              );
            })}
          </div>

          {/* Practice CTA */}
          <div className="mt-8 max-w-[65ch] rounded-2xl bg-primary/5 border border-primary/15 p-5 md:p-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base font-semibold">Practise with the AI Coach</h3>
                  {saved.practiceLaunched && (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Done
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Build confidence by practising this scenario with the AI acting as a child
                  participant before your real session.
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button size="lg" className="flex-1 h-11" onClick={handlePractice}>
                <Sparkles className="w-4 h-4 mr-2" />
                {saved.practiceLaunched ? 'Practise again' : 'Practise this scenario'}
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="flex-1 h-11"
                onClick={() => navigate('/practice')}
              >
                <LayoutGrid className="w-4 h-4 mr-2" />
                Browse all scenarios
              </Button>
            </div>
          </div>

          {/* Completion / hint */}
          {allDone ? (
            <div className="mt-6 max-w-[65ch] rounded-2xl bg-emerald-50 border border-emerald-200 p-5 text-center">
              <div className="w-11 h-11 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-2">
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="text-lg font-semibold text-emerald-800">Module completed!</h3>
              <p className="text-sm text-emerald-700 mt-1">
                You've finished all check-ins and the practice session. Your progress has been saved.
              </p>
              <Button variant="outline" className="mt-4" onClick={onBack}>
                Back to modules
              </Button>
            </div>
          ) : (
            <p className="mt-6 max-w-[65ch] text-xs text-muted-foreground text-center">
              This module completes automatically once you answer all check-ins and launch the
              practice session.
            </p>
          )}
        </article>
      </div>
    </div>
  );
}