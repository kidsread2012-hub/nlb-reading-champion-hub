import React from 'react';
import { Flame, Trophy, Star, Award, Lock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { BADGE_DEFS } from '@/hooks/useGamification';

const ICONS = { Star, Flame, Trophy, Award };

export default function BadgesCard({ stats, totalModules, completedModules }) {
  const earned = new Set(stats.badges || []);
  if (totalModules > 0 && completedModules >= totalModules) {
    earned.add('module_master');
  }

  return (
    <Card className="border-border/60">
      <CardContent className="p-5 md:p-6">
        <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
          <div>
            <h3 className="text-base font-semibold">Your achievements</h3>
            <p className="text-sm text-muted-foreground">Pop quiz badges &amp; streaks</p>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-100 text-orange-700 text-sm font-semibold">
            <Flame className="w-4 h-4" />
            Best streak: {stats.quiz_best_streak || 0}
          </span>
        </div>
        <div className="flex flex-wrap gap-2.5">
          {BADGE_DEFS.map((b) => {
            const isEarned = earned.has(b.id);
            const Icon = ICONS[b.icon] || Star;
            return (
              <div
                key={b.id}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm transition-colors ${
                  isEarned
                    ? 'bg-primary/5 border-primary/30 text-foreground'
                    : 'bg-muted/40 border-border/50 text-muted-foreground'
                }`}
                title={b.description}
              >
                {isEarned ? (
                  <Icon className="w-4 h-4 text-primary" />
                ) : (
                  <Lock className="w-4 h-4 text-muted-foreground/60" />
                )}
                <span className={isEarned ? 'font-medium' : ''}>{b.name}</span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}