import React from 'react';
import { Flame, Trophy, Star, Award, Lock } from 'lucide-react';
import { BADGE_DEFS } from '@/hooks/useGamification';

const ICONS = { Star, Flame, Trophy, Award };

const BADGE_COLORS = {
  first_pop_quiz: '#fbbf24',
  streak_3: '#fb923c',
  streak_5: '#f87171',
  perfect_module: '#34d399',
  module_master: '#a78bfa',
};

const RAINBOW_BORDER =
  'conic-gradient(from 180deg, #f87171, #fbbf24, #34d399, #22d3ee, #818cf8, #c084fc, #f87171)';

export default function BadgesCard({ stats, totalModules, completedModules }) {
  const earned = new Set(stats.badges || []);
  if (totalModules > 0 && completedModules >= totalModules) {
    earned.add('module_master');
  }

  return (
    <div className="rounded-xl border border-white/10 bg-[#1e252b] text-white shadow-sm">
      <div className="p-5 md:p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-5 gap-3 flex-wrap">
          <div>
            <h3 className="text-base font-semibold text-white">Your achievements</h3>
            <p className="text-sm text-white/50">Pop quiz badges &amp; streaks</p>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 text-white text-sm font-semibold">
            <Flame className="w-4 h-4 text-orange-400" />
            Best streak: {stats.quiz_best_streak || 0}
          </span>
        </div>

        {/* Quest tiles */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {BADGE_DEFS.map((b) => {
            const isEarned = earned.has(b.id);
            const Icon = ICONS[b.icon] || Star;
            const color = BADGE_COLORS[b.id] || '#fbbf24';

            if (isEarned) {
              return (
                <div
                  key={b.id}
                  className="rounded-xl p-[2px] aspect-square"
                  style={{ background: RAINBOW_BORDER }}
                  title={b.description}
                >
                  <div className="h-full w-full rounded-[10px] bg-[#232b33] flex flex-col items-center justify-center gap-2 px-1.5 text-center">
                    <div
                      className="w-11 h-11 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: `${color}22` }}
                    >
                      <Icon className="w-6 h-6" style={{ color }} strokeWidth={2.5} />
                    </div>
                    <span className="text-xs font-semibold text-white leading-tight">{b.name}</span>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={b.id}
                className="relative rounded-xl aspect-square border border-white/10 bg-[#2a333c] flex flex-col items-center justify-center gap-2 px-1.5 text-center overflow-hidden"
                title={b.description}
              >
                <Icon className="absolute inset-0 m-auto w-20 h-20 text-white/[0.04]" strokeWidth={1.2} />
                <div className="relative w-11 h-11 rounded-full flex items-center justify-center bg-white/[0.04]">
                  <Icon className="w-6 h-6 text-white/30" strokeWidth={2} />
                </div>
                <span className="relative text-xs font-medium text-white/40 leading-tight">{b.name}</span>
                <Lock className="absolute bottom-2 right-2 w-3.5 h-3.5 text-white/25" />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}