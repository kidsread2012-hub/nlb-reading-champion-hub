import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BookOpen, Clock, CheckCircle2, Circle, ArrowLeft, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

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

  // Module reader view
  if (activeModule) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 pb-24 md:pb-8">
        <button
          onClick={() => setActiveModule(null)}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to modules
        </button>

        <div className="mb-6">
          <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-3">
            {activeModule.category}
          </span>
          <h1 className="text-3xl font-bold mb-2">{activeModule.title}</h1>
          <p className="text-lg text-muted-foreground">{activeModule.description}</p>
          {activeModule.duration_minutes && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-3">
              <Clock className="w-4 h-4" />
              {activeModule.duration_minutes} min read
            </div>
          )}
        </div>

        <div className="prose prose-lg max-w-none mb-8">
          <ReactMarkdown>{activeModule.content}</ReactMarkdown>
        </div>

        <Button
          size="lg"
          className="w-full text-base h-14"
          onClick={() => handleCompleteModule(activeModule)}
        >
          <CheckCircle2 className="w-5 h-5 mr-2" />
          Mark as Completed
        </Button>
      </div>
    );
  }

  // Module list view
  const completedCount = Object.values(progress).filter((p) => p.status === 'completed').length;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 pb-24 md:pb-8">
      <div className="mb-8">
        <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center mb-4">
          <BookOpen className="w-7 h-7 text-blue-600" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Self-Paced Learning</h1>
        <p className="text-lg text-muted-foreground">
          Build your skills as a Reading Champion. You've completed {completedCount} of {modules.length} modules.
        </p>
      </div>

      {modules.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">Learning modules are being prepared. Check back soon!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {modules.map((mod) => {
            const prog = progress[mod.id];
            const isCompleted = prog?.status === 'completed';
            const isInProgress = prog?.status === 'in_progress';
            return (
              <Card
                key={mod.id}
                className="hover:shadow-md transition-all cursor-pointer"
                onClick={() => handleStartModule(mod)}
              >
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
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                        {mod.category}
                      </span>
                      {isInProgress && (
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                          In Progress
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold mb-1">{mod.title}</h3>
                    <p className="text-base text-muted-foreground line-clamp-2">{mod.description}</p>
                    {mod.duration_minutes && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                        <Clock className="w-4 h-4" />
                        {mod.duration_minutes} min
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}