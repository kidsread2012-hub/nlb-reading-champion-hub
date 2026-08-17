import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Clock, CheckCircle2, Sparkles, LayoutGrid } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import CheckpointCard from './CheckpointCard';

export default function ModuleReader({ module, onComplete, onBack }) {
  const navigate = useNavigate();
  const checkpoints = module.checkpoints || [];

  // Split content on {{CHECKPOINT}} markers and interleave checkpoint cards
  const parts = module.content.split(/\{\{CHECKPOINT\}\}/);

  const handlePractice = () => {
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

      <div className="prose prose-lg max-w-none mb-8">
        {parts.map((part, i) => (
          <React.Fragment key={i}>
            <ReactMarkdown>{part}</ReactMarkdown>
            {checkpoints[i] && <CheckpointCard checkpoint={checkpoints[i]} index={i + 1} />}
          </React.Fragment>
        ))}
      </div>

      {/* Practice CTA */}
      <div className="rounded-2xl border-2 border-primary/20 bg-primary/5 p-5 md:p-6 mb-6">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-bold">Practise with the AI Coach</h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              Build confidence by practising this scenario with the AI acting as a child participant
              before your real session.
            </p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button size="lg" className="flex-1 text-base h-12" onClick={handlePractice}>
            <Sparkles className="w-5 h-5 mr-2" />
            Practise this scenario
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

      <Button size="lg" className="w-full text-base h-14" onClick={() => onComplete(module)}>
        <CheckCircle2 className="w-5 h-5 mr-2" />
        Mark as Completed
      </Button>
    </div>
  );
}