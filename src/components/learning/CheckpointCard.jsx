import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, Lightbulb } from 'lucide-react';

export default function CheckpointCard({ checkpoint, index = 1 }) {
  const [revealed, setRevealed] = useState(false);

  return (
    <div className="my-6 rounded-2xl border-2 border-amber-200 bg-amber-50/60 p-5 md:p-6 not-prose">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-9 h-9 rounded-xl bg-amber-400 text-white flex items-center justify-center shrink-0">
          <HelpCircle className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide">
            Check-in {index}
          </p>
          <p className="text-lg font-semibold text-foreground mt-0.5">What would you do?</p>
        </div>
      </div>
      <p className="text-base text-foreground leading-relaxed mb-4 pl-12">
        {checkpoint.prompt}
      </p>
      <button
        onClick={() => setRevealed(!revealed)}
        className="flex items-center gap-2 ml-12 px-4 py-2 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-800 text-sm font-medium transition-colors"
      >
        <Lightbulb className="w-4 h-4" />
        {revealed ? 'Hide recommended approach' : 'Reveal recommended approach'}
        {revealed ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>
      {revealed && (
        <div className="mt-4 ml-12 p-4 rounded-xl bg-white border border-amber-200">
          <p className="text-sm font-semibold text-amber-700 mb-1.5 flex items-center gap-1.5">
            <Lightbulb className="w-4 h-4" /> Recommended approach
          </p>
          <p className="text-base text-foreground leading-relaxed">{checkpoint.model_answer}</p>
        </div>
      )}
    </div>
  );
}