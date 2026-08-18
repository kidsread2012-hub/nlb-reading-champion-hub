import React, { useState } from 'react';
import { CheckCircle2, Circle, BookOpen, ChevronDown, ChevronRight, HelpCircle } from 'lucide-react';

/**
 * Tabbed progress tree for the module reader.
 * Tab 1 "This module": content sections + pop quizzes + practice, synced to scroll.
 * Tab 2 "All modules": every module in the same track, current highlighted.
 */
export default function ProgressTree({
  treeItems = [],
  activeId,
  onJump,
  module,
  trackModules,
  progress,
  onSwitchModule,
  doneCount = 0,
  totalCount = 0,
}) {
  const [tab, setTab] = useState('module');
  const [open, setOpen] = useState(false);

  const TabButton = ({ id, label }) => (
    <button
      onClick={() => setTab(id)}
      className={`flex-1 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
        tab === id
          ? 'bg-primary/10 text-primary'
          : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
      }`}
    >
      {label}
    </button>
  );

  const NodeIcon = ({ done }) =>
    done ? (
      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 transition-transform duration-300" />
    ) : (
      <Circle className="w-4 h-4 text-border shrink-0" />
    );

  const TreeContent = () => {
    if (tab === 'module') {
      if (treeItems.length === 0) {
        return <p className="px-2.5 py-3 text-sm text-muted-foreground">No sections yet.</p>;
      }
      return (
        <div className="space-y-0.5">
          {treeItems.map((s) => {
            const isActive = activeId === s.id;
            const icon =
              s.type === 'quiz' ? (
                <HelpCircle className={`w-4 h-4 shrink-0 ${s.done ? 'text-emerald-500' : 'text-muted-foreground/60'}`} />
              ) : (
                <NodeIcon done={s.done} />
              );
            return (
              <button
                key={s.id}
                onClick={() => onJump && onJump(s.id)}
                className={`w-full flex items-center gap-2.5 pl-3 pr-2.5 py-2 rounded-lg text-sm text-left transition-colors relative ${
                  isActive
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                }`}
              >
                {isActive && <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-full bg-primary" />}
                {icon}
                <span className="line-clamp-1">{s.label}</span>
              </button>
            );
          })}
          {totalCount > 0 && (
            <div className="px-2.5 pt-3 mt-2 border-t border-border/60">
              <p className="text-xs text-muted-foreground">
                {doneCount} of {totalCount} steps complete
              </p>
            </div>
          )}
        </div>
      );
    }
    return (
      <div className="space-y-1">
        {trackModules.map((m) => {
          const st = progress[m.id]?.status;
          const isCurrent = m.id === module.id;
          const isDone = st === 'completed';
          const isStarted = st === 'in_progress';
          return (
            <button
              key={m.id}
              onClick={() => !isCurrent && onSwitchModule(m)}
              disabled={isCurrent}
              className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm text-left transition-colors ${
                isCurrent
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
              }`}
            >
              {isDone ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              ) : isStarted ? (
                <Circle className="w-4 h-4 text-amber-500 fill-amber-100/40 shrink-0" />
              ) : (
                <Circle className="w-4 h-4 text-border shrink-0" />
              )}
              <span className="line-clamp-1">{m.title}</span>
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <>
      {/* Desktop: sticky sidebar */}
      <aside className="hidden md:block w-64 shrink-0">
        <div className="sticky top-6">
          <div className="flex gap-1 p-1 mb-3 rounded-xl bg-muted/50">
            <TabButton id="module" label="This module" />
            <TabButton id="track" label="All modules" />
          </div>
          <div className="rounded-xl bg-card border border-border/60 p-2">
            <TreeContent />
          </div>
        </div>
      </aside>

      {/* Mobile: collapsible panel */}
      <div className="md:hidden mb-4">
        <button
          onClick={() => setOpen(!open)}
          className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-card border border-border/60 text-sm font-medium"
        >
          <span className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-primary" />
            {totalCount > 0 ? `Progress · ${doneCount}/${totalCount}` : 'Module contents'}
          </span>
          {open ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
        {open && (
          <div className="mt-2">
            <div className="flex gap-1 p-1 mb-2 rounded-xl bg-muted/50">
              <TabButton id="module" label="This module" />
              <TabButton id="track" label="All modules" />
            </div>
            <div className="rounded-xl bg-card border border-border/60 p-2">
              <TreeContent />
            </div>
          </div>
        )}
      </div>
    </>
  );
}