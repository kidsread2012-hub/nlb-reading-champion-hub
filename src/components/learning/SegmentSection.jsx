import React from 'react';
import ModuleCard from './ModuleCard';
import { Type } from 'lucide-react';

export default function SegmentSection({ segment, modules, progress, onStart }) {
  const Icon = segment.icon;
  const completedInSegment = modules.filter(
    (m) => progress[m.id]?.status === 'completed'
  ).length;

  const isLetterSound = (m) => !!m.content?.includes('LETTER_CARDS');
  const letterSoundModules = modules.filter(isLetterSound);
  const otherModules = modules.filter((m) => !isLetterSound(m));

  const hasLS = letterSoundModules.length > 0;
  const minLSOrder = hasLS
    ? Math.min(...letterSoundModules.map((m) => m.order))
    : Infinity;
  const maxLSOrder = hasLS
    ? Math.max(...letterSoundModules.map((m) => m.order))
    : -Infinity;

  const beforeLS = otherModules.filter((m) => m.order < minLSOrder);
  const afterLS = hasLS ? otherModules.filter((m) => m.order > maxLSOrder) : [];
  const lsCompleted = letterSoundModules.filter(
    (m) => progress[m.id]?.status === 'completed'
  ).length;

  return (
    <section className="mb-10">
      {/* Flat section header — matches Resources/Assessment pattern */}
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${segment.iconChipBg}`}>
          <Icon className={`w-5 h-5 ${segment.iconChipColor}`} />
        </div>
        <h2 className={`text-lg font-semibold ${segment.iconChipColor}`}>{segment.name}</h2>
        <div className="flex-1 h-px bg-border/60" />
        <span className="text-sm text-muted-foreground shrink-0">
          {completedInSegment}/{modules.length}
        </span>
      </div>

      <p className="text-base md:text-lg text-muted-foreground mb-5">
        {segment.tagline}
      </p>

      {modules.length === 0 ? (
        <p className="text-muted-foreground">Modules coming soon.</p>
      ) : (
        <div className="space-y-3">
          {beforeLS.map((mod) => (
            <ModuleCard
              key={mod.id}
              module={mod}
              progress={progress[mod.id]}
              leftEdge={segment.leftEdge}
              accentBg={segment.iconBg}
              onClick={() => onStart(mod)}
            />
          ))}
          {letterSoundModules.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 pt-1">
                <div className={`w-7 h-7 rounded-lg ${segment.iconChipBg} flex items-center justify-center`}>
                  <Type className={`w-4 h-4 ${segment.iconChipColor}`} />
                </div>
                <h3 className="text-base font-semibold text-foreground">Letter Sounds</h3>
                <span className="text-sm text-muted-foreground">
                  · {lsCompleted}/{letterSoundModules.length}
                </span>
              </div>
              {letterSoundModules.map((mod) => (
                <ModuleCard
                  key={mod.id}
                  module={mod}
                  progress={progress[mod.id]}
                  leftEdge={segment.leftEdge}
                  accentBg={segment.iconBg}
                  onClick={() => onStart(mod)}
                />
              ))}
            </div>
          )}
          {afterLS.map((mod) => (
            <ModuleCard
              key={mod.id}
              module={mod}
              progress={progress[mod.id]}
              leftEdge={segment.leftEdge}
              accentBg={segment.iconBg}
              onClick={() => onStart(mod)}
            />
          ))}
        </div>
      )}
    </section>
  );
}