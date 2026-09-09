import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { SEGMENTS } from '@/data/segments';
import SegmentSection from '@/components/learning/SegmentSection';
import ModuleReader from '@/components/learning/ModuleReader';
import { content, getModuleProgressMap, setModuleStatus } from '@/services';

export default function Learning() {
  const location = useLocation();
  const [modules, setModules] = useState([]);
  const [progress, setProgress] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeModule, setActiveModule] = useState(null);
  const [restoreScroll, setRestoreScroll] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const mods = await content.listModules('order', 50);
        setModules(mods);
        setProgress(getModuleProgressMap());

        // Reopen a module when returning from guided practice
        const reopenId = location.state?.reopenModuleId;
        if (reopenId) {
          const target = mods.find((m) => m.id === reopenId);
          if (target) {
            setActiveModule(target);
            setRestoreScroll(true);
            if (!getModuleProgressMap()[target.id]) {
              setModuleStatus(target.id, 'in_progress', target.title);
              setProgress(getModuleProgressMap());
            }
          }
          // Clear the state so it doesn't reopen on later visits
          window.history.replaceState({}, '');
        }
      } catch (err) {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleStartModule = (mod) => {
    setActiveModule(mod);
    setRestoreScroll(false);
    if (!progress[mod.id]) {
      setModuleStatus(mod.id, 'in_progress', mod.title);
      setProgress(getModuleProgressMap());
    }
  };

  const handleSwitchModule = (mod) => {
    setActiveModule(mod);
    setRestoreScroll(false);
    if (!progress[mod.id]) {
      setModuleStatus(mod.id, 'in_progress', mod.title);
      setProgress(getModuleProgressMap());
    }
  };

  const handleCompleteModule = (mod) => {
    const existing = progress[mod.id];
    if (!existing || existing.status === 'completed') return; // idempotent
    setModuleStatus(mod.id, 'completed', mod.title);
    setProgress(getModuleProgressMap());
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (activeModule) {
    const trackModules = modules.filter((m) => m.segment === activeModule.segment);
    return (
      <ModuleReader
        module={activeModule}
        onComplete={handleCompleteModule}
        onBack={() => setActiveModule(null)}
        trackModules={trackModules}
        progress={progress}
        onSwitchModule={handleSwitchModule}
        restoreScroll={restoreScroll}
      />
    );
  }

  const completedCount = Object.values(progress).filter(
    (p) => p.status === 'completed'
  ).length;
  const grouped = SEGMENTS.map((seg) => ({
    ...seg,
    modules: modules.filter((m) => m.segment === seg.id),
  }));

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 pb-24 md:pb-8">
      <div className="mb-10">
        <h1 className="text-3xl md:text-4xl font-bold mb-2 tracking-tight">Self-Paced Learning</h1>
        <p className="text-base md:text-lg text-muted-foreground">
          {modules.length} modules across two segments · {completedCount} completed so far.
        </p>
      </div>

      {grouped.map((seg) => (
        <SegmentSection
          key={seg.id}
          segment={seg}
          modules={seg.modules}
          progress={progress}
          onStart={handleStartModule}
        />
      ))}
    </div>
  );
}