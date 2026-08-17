import React from 'react';
import ModuleCard from './ModuleCard';

export default function SegmentSection({ segment, modules, progress, onStart }) {
  const Icon = segment.icon;
  const completedInSegment = modules.filter(
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