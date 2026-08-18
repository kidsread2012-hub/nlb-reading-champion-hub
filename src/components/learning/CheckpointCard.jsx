import React, { useState, useEffect } from 'react';
import { HelpCircle, Loader2, CheckCircle2, XCircle, Lightbulb } from 'lucide-react';
import { base44 } from '@/api/base44Client';

// Module-level cache keyed by checkpoint prompt — avoids re-calling the LLM
const cache = new Map();

export default function CheckpointCard({ checkpoint, index = 1, initialSelected = null, onAnswered }) {
  const [options, setOptions] = useState(null);
  const [explanation, setExplanation] = useState('');
  const [loading, setLoading] = useState(!cache.has(checkpoint.prompt));
  const [selected, setSelected] = useState(initialSelected);
  const [error, setError] = useState(false);

  useEffect(() => {
    const cached = cache.get(checkpoint.prompt);
    if (cached) {
      setOptions(cached.options);
      setExplanation(cached.explanation);
      setLoading(false);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const res = await base44.functions.invoke('generateCheckpointOptions', {
          prompt: checkpoint.prompt,
          model_answer: checkpoint.model_answer,
        });
        if (cancelled) return;
        const data = res.data;
        cache.set(checkpoint.prompt, data);
        setOptions(data.options);
        setExplanation(data.explanation);
        setLoading(false);
      } catch (err) {
        if (cancelled) return;
        setError(true);
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [checkpoint.prompt, checkpoint.model_answer]);

  const handleSelect = (i) => {
    if (selected !== null) return;
    setSelected(i);
    if (onAnswered) onAnswered(index - 1, i, options[i].is_recommended);
  };

  const handleRetry = () => {
    setError(false);
    setLoading(true);
    setSelected(null);
    cache.delete(checkpoint.prompt);
    (async () => {
      try {
        const res = await base44.functions.invoke('generateCheckpointOptions', {
          prompt: checkpoint.prompt,
          model_answer: checkpoint.model_answer,
        });
        const data = res.data;
        cache.set(checkpoint.prompt, data);
        setOptions(data.options);
        setExplanation(data.explanation);
        setLoading(false);
      } catch (err) {
        setError(true);
        setLoading(false);
      }
    })();
  };

  return (
    <div className="my-7 rounded-2xl bg-muted/40 border border-border/60 p-5 md:p-6 not-prose">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
          <HelpCircle className="w-5 h-5" />
        </div>
        <div>
          <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Pop quiz {index}
          </p>
          <p className="text-base font-semibold text-foreground mt-0.5">What would you do?</p>
        </div>
      </div>
      <p className="text-base text-foreground leading-relaxed mb-4 pl-12">
        {checkpoint.prompt}
      </p>

      {/* Loading state */}
      {loading && (
        <div className="pl-12 flex items-center gap-2 text-muted-foreground py-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-base">Preparing options...</span>
        </div>
      )}

      {/* Error fallback: show the recommended answer directly */}
      {error && !loading && (
        <div className="pl-12 space-y-3">
          <div className="p-4 rounded-xl bg-card border border-border/60">
            <p className="text-base font-semibold text-primary mb-1.5 flex items-center gap-1.5">
              <Lightbulb className="w-4 h-4" /> Recommended approach
            </p>
            <p className="text-base text-foreground leading-relaxed">{checkpoint.model_answer}</p>
          </div>
          <button
            onClick={handleRetry}
            className="text-base text-amber-700 underline hover:text-amber-800"
          >
            Try multiple-choice again
          </button>
        </div>
      )}

      {/* Multiple-choice options */}
      {options && !loading && !error && (
        <div className="pl-12 space-y-2.5">
          {options.map((opt, i) => {
            const isSelected = selected === i;
            const isRecommended = opt.is_recommended;
            const showResult = selected !== null;

            let cls = 'border border-border bg-card hover:border-primary/40 hover:bg-primary/5';
            if (showResult) {
              if (isRecommended) {
                cls = 'border border-emerald-500 bg-emerald-50';
              } else if (isSelected) {
                cls = 'border border-red-400 bg-red-50';
              } else {
                cls = 'border border-border bg-card opacity-60';
              }
            }

            return (
              <button
                key={i}
                onClick={() => handleSelect(i)}
                disabled={showResult}
                className={`flex items-start gap-3 w-full text-left p-4 rounded-xl transition-colors ${cls}`}
              >
                <div className="shrink-0 mt-0.5">
                  {showResult && isRecommended && <CheckCircle2 className="w-5 h-5 text-green-600" />}
                  {showResult && !isRecommended && isSelected && <XCircle className="w-5 h-5 text-red-500" />}
                  {!showResult && (
                    <div className="w-5 h-5 rounded-full border-2 border-muted-foreground/30" />
                  )}
                </div>
                <span className="text-base text-foreground leading-relaxed">{opt.text}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Status line after selection */}
      {selected !== null && options && !error && (
        <div className="mt-4 ml-12">
          {options[selected]?.is_recommended ? (
            <p className="text-sm font-semibold text-emerald-600">Nice! That's the recommended approach.</p>
          ) : (
            <p className="text-sm font-semibold text-amber-600">
              Not quite — the recommended approach is highlighted below.
            </p>
          )}
        </div>
      )}

      {/* Explanation reveal after selection */}
      {selected !== null && options && !error && (
        <div className="mt-4 ml-12 p-4 rounded-xl bg-card border border-border/60">
          <p className="text-base font-semibold text-primary mb-1.5 flex items-center gap-1.5">
            <Lightbulb className="w-4 h-4" /> Why this approach?
          </p>
          <p className="text-base text-foreground leading-relaxed">{explanation}</p>
        </div>
      )}
    </div>
  );
}