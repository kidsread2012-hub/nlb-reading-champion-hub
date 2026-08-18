import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, ClipboardCheck, MessageCircle, ArrowRight, Award, Users } from 'lucide-react';
import BadgesCard from '@/components/learning/BadgesCard';
import { useGamification } from '@/hooks/useGamification';

export default function Dashboard() {
  const [stats, setStats] = useState({ assessments: 0, completedModules: 0, clubs: 0, totalModules: 0 });
  const [loading, setLoading] = useState(true);
  const { stats: quizStats } = useGamification();

  useEffect(() => {
    async function loadStats() {
      try {
        const [assessments, progress, clubs, modules] = await Promise.all([
          base44.entities.Assessment.list(),
          base44.entities.LearningProgress.filter({ status: 'completed' }),
          base44.entities.Club.list(),
          base44.entities.LearningModule.list(),
        ]);
        setStats({
          assessments: assessments.length,
          completedModules: progress.length,
          clubs: clubs.length,
          totalModules: modules.length,
        });
      } catch (err) {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  const features = [
    {
      to: '/learning',
      icon: BookOpen,
      title: 'Self-Paced Learning',
      description: 'Build your skills with training modules on reading confidence, reading strategies, and volunteer best practices.',
    },
    {
      to: '/assessment',
      icon: ClipboardCheck,
      title: 'Assessment Tool',
      description: 'Administer pre and post-tests, track reading proficiency levels, and identify areas for support.',
    },
    {
      to: '/coach',
      icon: MessageCircle,
      title: 'AI Learning Coach',
      description: 'Get personalised guidance, practice activities, and on-demand support for your reading sessions.',
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 py-8 md:py-12 pb-24 md:pb-12">
      {/* Hero */}
      <div className="mb-10 md:mb-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-3 tracking-tight text-balance">
          Welcome to your Volunteer Learning Hub
        </h1>
        <p className="text-sm md:text-base font-medium text-primary mb-2 italic">
          "Every Volunteer's a Reading Champion"
        </p>
        <p className="text-base md:text-lg text-muted-foreground max-w-xl mb-6">
          Everything you need to support children on their reading journey — learn at your own pace,
          assess their progress, and get AI-powered coaching.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link to="/learning">
            <Button size="lg" className="h-12 px-6 text-base w-full sm:w-auto">
              Continue learning
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
          <Link to="/assessment">
            <Button variant="outline" size="lg" className="h-12 px-6 text-base w-full sm:w-auto">
              Run an assessment
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 md:gap-6 mb-12">
        <StatCard icon={ClipboardCheck} label="Assessments" value={loading ? '—' : stats.assessments} />
        <StatCard icon={Award} label="Modules Done" value={loading ? '—' : stats.completedModules} />
        <StatCard icon={Users} label="Active Clubs" value={loading ? '—' : stats.clubs} />
      </div>

      {/* Achievements */}
      <div className="mb-10">
        <BadgesCard stats={quizStats} totalModules={stats.totalModules} completedModules={stats.completedModules} />
      </div>

      {/* Feature cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {features.map((f) => (
          <Link key={f.to} to={f.to}>
            <Card className="h-full hover:shadow-md transition-all cursor-pointer group">
              <CardContent className="p-6 md:p-7">
                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-5">
                  <f.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-base font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground mb-5 leading-relaxed">{f.description}</p>
                <div className="flex items-center gap-2 text-primary text-sm font-medium group-hover:gap-3 transition-all">
                  Open
                  <ArrowRight className="w-4 h-4" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value }) {
  return (
    <Card className="border-border/60">
      <CardContent className="p-4 md:p-5 text-center">
        <Icon className="w-5 h-5 text-primary mx-auto mb-2" />
        <p className="text-2xl md:text-3xl font-bold">{value}</p>
        <p className="text-xs md:text-sm text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  );
}