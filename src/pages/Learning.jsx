import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Loader2, Zap, BookOpen } from 'lucide-react';
import SegmentSection from '@/components/learning/SegmentSection';
import ModuleReader from '@/components/learning/ModuleReader';
import { getModuleProgressMap, setModuleStatus } from '@/lib/localStore';

const SEGMENTS = [
  {
    id: 'power_up',
    name: 'Power Up!',
    tagline: 'Growing confident, independent readers',
    icon: Zap,
    iconBg: 'bg-amber-500',
    iconColor: 'text-white',
    panelBg: 'bg-white',
    panelBorder: 'border-amber-200/70',
    bandBg: 'bg-amber-100',
    titleColor: 'text-amber-900',
    subtitleColor: 'text-amber-700/80',
    accent: 'amber',
    accentHex: '#F59E0B',
    leftEdge: 'border-l-4 border-l-amber-500',
    iconChipBg: 'bg-amber-100',
    iconChipColor: 'text-amber-600',
  },
  {
    id: 'storytelling',
    name: 'Read',
    tagline: 'Reading aloud & storytelling',
    icon: BookOpen,
    iconBg: 'bg-sky-700',
    iconColor: 'text-white',
    panelBg: 'bg-white',
    panelBorder: 'border-sky-200/70',
    bandBg: 'bg-sky-100',
    titleColor: 'text-sky-900',
    subtitleColor: 'text-sky-700/80',
    accent: 'sky',
    accentHex: '#0284C7',
    leftEdge: 'border-l-4 border-l-sky-700',
    iconChipBg: 'bg-sky-100',
    iconChipColor: 'text-sky-700',
  },
];

export default function Learning() {
  const location = useLocation();
  const [modules, setModules] = useState([]);
  const [progress, setProgress] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeModule, setActiveModule] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        const mods = await base44.entities.LearningModule.list('order', 50);
        setModules(mods);
        setProgress(getModuleProgressMap());

        // Reopen a module when returning from guided practice
        const reopenId = location.state?.reopenModuleId;
        if (reopenId) {
          const target = mods.find((m) => m.id === reopenId);
          if (target) {
            setActiveModule(target);
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
    if (!progress[mod.id]) {
      setModuleStatus(mod.id, 'in_progress', mod.title);
      setProgress(getModuleProgressMap());
    }
  };

  const handleSwitchModule = (mod) => {
    setActiveModule(mod);
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