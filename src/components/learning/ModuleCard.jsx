import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, CheckCircle2, Circle } from 'lucide-react';

export default function ModuleCard({ module, progress, onClick }) {
  const isCompleted = progress?.status === 'completed';
  const isInProgress = progress?.status === 'in_progress';

  return (
    <Card className="hover:shadow-md transition-all cursor-pointer" onClick={onClick}>
      <CardContent className="p-5 flex items-start gap-4">
        <div className="shrink-0 mt-1">
          {isCompleted ? (
            <CheckCircle2 className="w-6 h-6 text-emerald-500" />
          ) : isInProgress ? (
            <Circle className="w-6 h-6 text-amber-500 fill-amber-100" />
          ) : (
            <Circle className="w-6 h-6 text-muted-foreground" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          {isInProgress && (
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 mb-1 inline-block">
              In Progress
            </span>
          )}
          <h3 className="text-lg font-semibold mb-1">{module.title}</h3>
          <p className="text-base text-muted-foreground line-clamp-2">{module.description}</p>
          {module.duration_minutes && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
              <Clock className="w-4 h-4" />
              {module.duration_minutes} min
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}