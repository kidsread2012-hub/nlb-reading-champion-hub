import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BookOpen, ClipboardCheck, MessageCircle, BarChart3, ArrowRight, Award, TrendingUp, Users } from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState({ assessments: 0, completedModules: 0, clubs: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const [assessments, progress, clubs] = await Promise.all([
          base44.entities.Assessment.list(),
          base44.entities.LearningProgress.filter({ status: 'completed' }),
          base44.entities.Club.list(),
        ]);
        setStats({
          assessments: assessments.length,
          completedModules: progress.length,
          clubs: clubs.length,
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
      description: 'Build your skills with training modules on phonics, reading strategies, and volunteer best practices.',
      color: 'from-blue-500 to-blue-600',
    },
    {
      to: '/assessment',
      icon: ClipboardCheck,
      title: 'Assessment Tool',
      description: 'Administer pre and post-tests, track reading proficiency levels, and identify areas for support.',
      color: 'from-amber-500 to-orange-600',
    },
    {
      to: '/coach',
      icon: MessageCircle,
      title: 'AI Learning Coach',
      description: 'Get personalised guidance, practice activities, and on-demand support for your reading sessions.',
      color: 'from-emerald-500 to-teal-600',
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 md:py-12 pb-24 md:pb-12">
      {/* Hero */}
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
          <Award className="w-4 h-4" />
          Reading Champions Program
        </div>
        <h1 className="text-3xl md:text-5xl font-bold mb-3 text-balance">
          Welcome to your Volunteer Learning Hub
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl">
          Everything you need to support children on their reading journey — learn at your own pace,
          assess their progress, and get AI-powered coaching.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 md:gap-4 mb-10">
        <StatCard icon={ClipboardCheck} label="Assessments" value={loading ? '—' : stats.assessments} />
        <StatCard icon={Award} label="Modules Done" value={loading ? '—' : stats.completedModules} />
        <StatCard icon={Users} label="Active Clubs" value={loading ? '—' : stats.clubs} />
      </div>

      {/* Feature cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {features.map((f) => (
          <Link key={f.to} to={f.to}>
            <Card className="h-full hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer group">
              <CardContent className="p-6">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-4`}>
                  <f.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">{f.title}</h3>
                <p className="text-base text-muted-foreground mb-4">{f.description}</p>
                <div className="flex items-center gap-2 text-primary font-medium group-hover:gap-3 transition-all">
                  Open
                  <ArrowRight className="w-4 h-4" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Quick link to insights */}
      <Link to="/insights" className="mt-6 block">
        <Card className="hover:shadow-md transition-all">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <BarChart3 className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold">View Insights Dashboard</h3>
              <p className="text-sm text-muted-foreground">See assessment scores and progress across all clubs</p>
            </div>
            <ArrowRight className="w-5 h-5 text-muted-foreground" />
          </CardContent>
        </Card>
      </Link>
    </div>
  );
}

function StatCard({ icon: Icon, label, value }) {
  return (
    <Card>
      <CardContent className="p-4 md:p-5 text-center">
        <Icon className="w-6 h-6 text-primary mx-auto mb-2" />
        <p className="text-2xl md:text-3xl font-bold">{value}</p>
        <p className="text-xs md:text-sm text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  );
}