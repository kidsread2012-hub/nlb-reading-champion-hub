import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, Zap, Mic } from 'lucide-react';
import SegmentSection from '@/components/learning/SegmentSection';
import ModuleReader from '@/components/learning/ModuleReader';

const SEGMENTS = [
  {
    id: 'power_up',
    name: 'Power Up!',
    tagline: 'Phonics e-learning',
    icon: Zap,
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
  },
  {
    id: 'storytelling',
    name: 'Storytelling',
    tagline: 'Reading aloud & storytelling',
    icon: Mic,
    iconBg: 'bg-rose-100',
    iconColor: 'text-rose-600',
  },
];

export default function Learning() {
  const [modules, setModules] = useState([]);
  const [progress, setProgress] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeModule, setActiveModule] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [mods, prog] = await Promise.all([
          base44.entities.LearningModule.list('order', 50),
          base44.entities.LearningProgress.list(),
        ]);
        setModules(mods);
        const progressMap = {};
        prog.forEach((p) => {
          progressMap[p.module_id] = p;
        });
        setProgress(progressMap);
      } catch (err) {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleStartModule = async (mod) => {
    setActiveModule(mod);
    if (!progress[mod.id]) {
      try {
        const created = await base44.entities.LearningProgress.create({
          module_id: mod.id,
          module_title: mod.title,
          status: 'in_progress',
        });
        setProgress((prev) => ({ ...prev, [mod.id]: created }));
      } catch (err) {
        // ignore
      }
    }
  };

  const handleCompleteModule = async (mod) => {
    try {
      if (progress[mod.id]) {
        const updated = await base44.entities.LearningProgress.update(progress[mod.id].id, {
          status: 'completed',
          completed_date: new Date().toISOString().split('T')[0],
        });
        setProgress((prev) => ({ ...prev, [mod.id]: updated }));
      }
    } catch (err) {
      // ignore
    }
    setActiveModule(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (activeModule) {
    return (
      <ModuleReader
        module={activeModule}
        onComplete={handleCompleteModule}
        onBack={() => setActiveModule(null)}
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Self-Paced Learning</h1>
        <p className="text-lg text-muted-foreground">
          Build your skills as a Reading Champion. You've completed {completedCount} of{' '}
          {modules.length} modules across two learning segments.
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