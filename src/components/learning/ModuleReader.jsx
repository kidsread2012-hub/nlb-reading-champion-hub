import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Clock, CheckCircle2, Sparkles, LayoutGrid } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import CheckpointCard from './CheckpointCard';

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

export default function ModuleReader({ module, onComplete, onBack }) {
  const navigate = useNavigate();
  const checkpoints = module.checkpoints || [];
  const [saved, setSaved] = useState(() => loadProgress(module.id));
  const completedRef = useRef(false);

  const parts = module.content.split(/\{\{CHECKPOINT\}\}/);
  const answeredCount = Object.keys(saved.answered).length;
  const totalSteps = checkpoints.length + 1; // +1 for practice
  const doneSteps = answeredCount + (saved.practiceLaunched ? 1 : 0);
  const allDone = answeredCount === checkpoints.length && saved.practiceLaunched;

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
    <div className="max-w-3xl mx-auto px-4 py-8 pb-24 md:pb-8">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to modules
      </button>

      <div className="mb-6">
        <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-3">
          {module.category}
        </span>
        <h1 className="text-3xl font-bold mb-2">{module.title}</h1>
        <p className="text-lg text-muted-foreground">{module.description}</p>
        {module.duration_minutes && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-3">
            <Clock className="w-4 h-4" />
            {module.duration_minutes} min read
          </div>
        )}
      </div>

      {/* Live progress indicator */}
      {!allDone && (
        <div className="sticky top-14 md:top-0 z-10 mb-6 rounded-xl border border-border bg-card/90 backdrop-blur p-3 flex items-center gap-3">
          <div className="flex-1">
            <p className="text-sm font-medium">
              {doneSteps} of {totalSteps} steps complete
            </p>
            <div className="h-2 bg-muted rounded-full mt-2 overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-300"
                style={{ width: `${(doneSteps / totalSteps) * 100}%` }}
              />
            </div>
          </div>
          <span className="text-xs text-muted-foreground shrink-0">
            {saved.practiceLaunched ? 'Practice done' : 'Practice pending'}
          </span>
        </div>
      )}

      <div className="prose prose-lg max-w-none mb-8">
        {parts.map((part, i) => (
          <div key={i}>
            <ReactMarkdown>{part}</ReactMarkdown>
            {checkpoints[i] && (
              <CheckpointCard
                checkpoint={checkpoints[i]}
                index={i + 1}
                initialSelected={saved.answered[i] !== undefined ? saved.answered[i] : null}
                onAnswered={handleAnswered}
              />
            )}
          </div>
        ))}
      </div>

      {/* Practice CTA */}
      <div className="rounded-2xl border-2 border-primary/20 bg-primary/5 p-5 md:p-6 mb-6">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-lg font-bold">Practise with the AI Coach</h3>
              {saved.practiceLaunched && (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Done
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">
              Build confidence by practising this scenario with the AI acting as a child participant
              before your real session.
            </p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button size="lg" className="flex-1 text-base h-12" onClick={handlePractice}>
            <Sparkles className="w-5 h-5 mr-2" />
            {saved.practiceLaunched ? 'Practise again' : 'Practise this scenario'}
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="flex-1 text-base h-12"
            onClick={() => navigate('/practice')}
          >
            <LayoutGrid className="w-5 h-5 mr-2" />
            Browse all practice scenarios
          </Button>
        </div>
      </div>

      {/* Completion banner or hint */}
      {allDone ? (
        <div className="rounded-2xl border-2 border-green-500 bg-green-50 p-5 md:p-6 text-center">
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 className="w-7 h-7 text-green-600" />
          </div>
          <h3 className="text-xl font-bold text-green-800">Module completed!</h3>
          <p className="text-sm text-green-700 mt-1">
            You've finished all check-ins and the practice session. Your progress has been saved.
          </p>
          <Button variant="outline" className="mt-4" onClick={onBack}>
            Back to modules
          </Button>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground text-center">
          This module completes automatically once you answer all check-ins and launch the practice session.
        </p>
      )}
    </div>
  );
}