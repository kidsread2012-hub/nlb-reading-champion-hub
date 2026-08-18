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

  const minLSOrder = letterSoundModules.length
    ? Math.min(...letterSoundModules.map((m) => m.order))
    : Infinity;
  const maxLSOrder = letterSoundModules.length
    ? Math.max(...letterSoundModules.map((m) => m.order))
    : -Infinity;

  const beforeLS = otherModules.filter((m) => m.order < minLSOrder);
  const afterLS = otherModules.filter((m) => m.order > maxLSOrder);
  const lsCompleted = letterSoundModules.filter(
    (m) => progress[m.id]?.status === 'completed'
  ).length;

  return (
    <div className="mb-12">
      <div className="flex items-center gap-3 mb-6">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${segment.iconBg}`}>
          <Icon className={`w-5 h-5 ${segment.iconColor}`} />
        </div>
        <div>
          <h2 className="text-xl font-semibold">{segment.name}</h2>
          <p className="text-sm text-muted-foreground">
            {segment.tagline} · {completedInSegment}/{modules.length} completed
          </p>
        </div>
      </div>
      {modules.length === 0 ? (
        <p className="text-muted-foreground pl-2">Modules coming soon.</p>
      ) : (
        <div className="space-y-3">
          {beforeLS.map((mod) => (
            <ModuleCard
              key={mod.id}
              module={mod}
              progress={progress[mod.id]}
              onClick={() => onStart(mod)}
            />
          ))}
          {letterSoundModules.length > 0 && (
            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
              <div className="flex items-center gap-2 mb-3 px-1">
                <div className="w-7 h-7 rounded-lg bg-primary/15 flex items-center justify-center">
                  <Type className="w-4 h-4 text-primary" />
                </div>
                <h3 className="text-sm font-semibold text-primary">Letter Sounds</h3>
                <span className="text-xs text-muted-foreground">
                  · {lsCompleted}/{letterSoundModules.length} completed
                </span>
              </div>
              <div className="space-y-3">
                {letterSoundModules.map((mod) => (
                  <ModuleCard
                    key={mod.id}
                    module={mod}
                    progress={progress[mod.id]}
                    onClick={() => onStart(mod)}
                  />
                ))}
              </div>
            </div>
          )}
          {afterLS.map((mod) => (
            <ModuleCard
              key={mod.id}
              module={mod}
              progress={progress[mod.id]}
              onClick={() => onStart(mod)}
            />
          ))}
        </div>
      )}
    </div>
  );
}