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
    <section className={`mb-10 rounded-3xl border ${segment.panelBorder} ${segment.panelBg} overflow-hidden`}>
      {/* Accent band header */}
      <header className={`px-5 md:px-7 py-5 ${segment.bandBg} flex items-center gap-3`}>
        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${segment.iconBg} shadow-sm`}>
          <Icon className={`w-5 h-5 ${segment.iconColor}`} />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className={`text-xl font-bold ${segment.titleColor}`}>{segment.name}</h2>
          <p className={`text-sm ${segment.subtitleColor} truncate`}>
            {segment.tagline} · {completedInSegment}/{modules.length} completed
          </p>
        </div>
      </header>

      {/* Body */}
      <div className="px-5 md:px-7 py-6">
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
    </section>
  );
}