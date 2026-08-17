import React from 'react';
import ModuleCard from './ModuleCard';

export default function SegmentSection({ segment, modules, progress, onStart }) {
  const Icon = segment.icon;
  const completedInSegment = modules.filter(
    (m) => progress[m.id]?.status === 'completed'
  ).length;

  return (
    <div className="mb-10">
      <div className="flex items-center gap-3 mb-5">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${segment.iconBg}`}>
          <Icon className={`w-6 h-6 ${segment.iconColor}`} />
        </div>
        <div>
          <h2 className="text-2xl font-bold">{segment.name}</h2>
          <p className="text-sm text-muted-foreground">
            {segment.tagline} · {completedInSegment}/{modules.length} completed
          </p>
        </div>
      </div>
      {modules.length === 0 ? (
        <p className="text-muted-foreground pl-2">Modules coming soon.</p>
      ) : (
        <div className="space-y-3">
          {modules.map((mod) => (
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