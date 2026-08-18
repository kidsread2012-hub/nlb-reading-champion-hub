import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, CheckCircle2, Circle } from 'lucide-react';

export default function ModuleCard({ module, progress, onClick }) {
  const isCompleted = progress?.status === 'completed';
  const isInProgress = progress?.status === 'in_progress';

  if (module.coming_soon) {
    return (
      <Card className="border-dashed border-border bg-muted/30 opacity-80">
        <CardContent className="p-5 md:p-6 flex items-start gap-4">
          <div className="shrink-0 mt-0.5">
            <Clock className="w-5 h-5 text-muted-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-sm font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground mb-1.5 inline-block">
              Coming Soon
            </span>
            <h3 className="text-lg font-semibold mb-1 text-muted-foreground">{module.title}</h3>
            <p className="text-base text-muted-foreground line-clamp-2 leading-relaxed">{module.description}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-sm transition-all cursor-pointer border-border/60" onClick={onClick}>
      <CardContent className="p-5 md:p-6 flex items-start gap-4">
        <div className="shrink-0 mt-0.5">
          {isCompleted ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          ) : isInProgress ? (
            <Circle className="w-5 h-5 text-amber-500 fill-amber-100" />
          ) : (
            <Circle className="w-5 h-5 text-border" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          {isInProgress && (
            <span className="text-sm font-medium px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 mb-1.5 inline-block">
              In Progress
            </span>
          )}
          <h3 className="text-lg font-semibold mb-1">{module.title}</h3>
          <p className="text-base text-muted-foreground line-clamp-2 leading-relaxed">{module.description}</p>
          {module.duration_minutes && (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-2.5">
              <Clock className="w-4 h-4" />
              {module.duration_minutes} min
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}