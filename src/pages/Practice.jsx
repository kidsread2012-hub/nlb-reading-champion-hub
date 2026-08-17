import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Zap, Mic, ArrowRight } from 'lucide-react';
import { PRACTICE_SCENARIOS } from '@/lib/practiceScenarios';
import { Card, CardContent } from '@/components/ui/card';

const SEGMENT_META = {
  power_up: { label: 'Power Up!', icon: Zap, iconBg: 'bg-amber-100', iconColor: 'text-amber-600' },
  storytelling: { label: 'Storytelling', icon: Mic, iconBg: 'bg-rose-100', iconColor: 'text-rose-600' },
};

export default function Practice() {
  const navigate = useNavigate();

  const handleStart = (scenario) => {
    navigate('/coach', {
      state: {
        practiceContext: {
          title: scenario.title,
          scenario_prompt: scenario.scenario_prompt,
          child_age: scenario.child_age || '5',
        },
      },
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 pb-24 md:pb-8">
      <div className="mb-10">
        <h1 className="text-3xl md:text-4xl font-bold mb-2 tracking-tight">AI Practice Scenarios</h1>
        <p className="text-base md:text-lg text-muted-foreground max-w-2xl">
          Build confidence by practising realistic scenarios with the AI acting as a child
          participant. Pick a scenario to start.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {PRACTICE_SCENARIOS.map((scenario) => {
          const meta = SEGMENT_META[scenario.segment];
          const Icon = meta.icon;
          return (
            <Card key={scenario.id} className="hover:shadow-sm transition-all flex flex-col border-border/60">
              <CardContent className="p-6 flex flex-col h-full">
                <div className="flex items-center gap-2 mb-3">
                  <div className={`w-8 h-8 rounded-lg ${meta.iconBg} flex items-center justify-center`}>
                    <Icon className={`w-4 h-4 ${meta.iconColor}`} />
                  </div>
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                    {meta.label}
                  </span>
                </div>
                <h3 className="text-lg font-semibold mb-1">{scenario.title}</h3>
                <p className="text-sm text-muted-foreground mb-4 flex-1">{scenario.description}</p>
                <button
                  onClick={() => handleStart(scenario)}
                  className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                  Start practice
                  <ArrowRight className="w-4 h-4" />
                </button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}