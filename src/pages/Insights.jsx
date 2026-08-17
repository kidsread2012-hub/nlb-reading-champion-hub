import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, BarChart3, TrendingUp, Users, Award } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line,
} from 'recharts';

const CHART_COLORS = ['#2563eb', '#f97316', '#10b981', '#eab308', '#a855f7', '#ec4899'];

export default function Insights() {
  const [assessments, setAssessments] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedClub, setSelectedClub] = useState('all');

  useEffect(() => {
    async function loadData() {
      try {
        const [assessmentsList, clubsList] = await Promise.all([
          base44.entities.Assessment.list('-created_date', 500),
          base44.entities.Club.list(),
        ]);
        setAssessments(assessmentsList);
        setClubs(clubsList);
      } catch (err) {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  const filtered = selectedClub === 'all'
    ? assessments
    : assessments.filter((a) => a.club_name === selectedClub);

  // Stats
  const totalAssessments = filtered.length;
  const totalChildren = new Set(filtered.map((a) => a.child_name)).size;
  const avgScore = totalAssessments > 0
    ? Math.round((filtered.reduce((sum, a) => sum + (a.total_score || 0), 0) / filtered.length) * 10) / 10
    : 0;

  // Level distribution
  const levelData = ['Level 1', 'Level 2', 'Level 3'].map((level) => ({
    name: level,
    count: filtered.filter((a) => a.proficiency_level === level).length,
  }));

  // Club comparison
  const clubData = clubs.map((club) => {
    const clubAssessments = assessments.filter((a) => a.club_name === club.name);
    const avg = clubAssessments.length > 0
      ? Math.round((clubAssessments.reduce((s, a) => s + (a.total_score || 0), 0) / clubAssessments.length) * 10) / 10
      : 0;
    return { name: club.name, avgScore: avg, count: clubAssessments.length };
  });

  // Pre vs Post comparison per child
  const childProgress = {};
  filtered.forEach((a) => {
    if (!childProgress[a.child_name]) childProgress[a.child_name] = {};
    childProgress[a.child_name][a.test_type] = a;
  });
  const progressData = Object.entries(childProgress)
    .filter(([, tests]) => tests.pre && tests.post)
    .map(([name, tests]) => ({
      name,
      pre: tests.pre.total_score || 0,
      post: tests.post.total_score || 0,
    }));

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 pb-24 md:pb-8">
      <div className="mb-8">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
          <BarChart3 className="w-7 h-7 text-primary" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Insights Dashboard</h1>
        <p className="text-lg text-muted-foreground">Track assessment scores and reading progress across clubs.</p>
      </div>

      {/* Filter */}
      <div className="mb-6">
        <Select value={selectedClub} onValueChange={setSelectedClub}>
          <SelectTrigger className="w-full md:w-64 text-base h-12">
            <SelectValue placeholder="Filter by club" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="text-base">All Clubs</SelectItem>
            {clubs.map((c) => (
              <SelectItem key={c.id} value={c.name} className="text-base">{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {totalAssessments === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-lg text-muted-foreground">No assessment data yet. Start by running an assessment.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 md:gap-4 mb-6">
            <StatCard icon={Users} label="Children" value={totalChildren} />
            <StatCard icon={Award} label="Assessments" value={totalAssessments} />
            <StatCard icon={TrendingUp} label="Avg Score" value={`${avgScore}/${filtered[0]?.total_possible || 62}`} />
          </div>

          {/* Level distribution */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-xl">Reading Proficiency Distribution</CardTitle>
              <CardDescription>Number of children at each proficiency level</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={levelData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" tick={{ fontSize: 14 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 14 }} />
                  <Tooltip contentStyle={{ fontSize: 14 }} />
                  <Bar dataKey="count" fill="#2563eb" radius={[8, 8, 0, 0]} name="Children" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Club comparison */}
          {selectedClub === 'all' && clubData.length > 0 && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-xl">Average Score by Club</CardTitle>
                <CardDescription>Compare performance across all clubs</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={clubData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis type="number" tick={{ fontSize: 14 }} domain={[0, 62]} />
                    <YAxis dataKey="name" type="category" tick={{ fontSize: 13 }} width={120} />
                    <Tooltip contentStyle={{ fontSize: 14 }} />
                    <Bar dataKey="avgScore" fill="#f97316" radius={[0, 8, 8, 0]} name="Avg Score" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Pre vs Post progress */}
          {progressData.length > 0 && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-xl">Pre vs Post-Test Progress</CardTitle>
                <CardDescription>Children who have completed both tests</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={progressData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="name" tick={{ fontSize: 13 }} />
                    <YAxis tick={{ fontSize: 14 }} domain={[0, 62]} />
                    <Tooltip contentStyle={{ fontSize: 14 }} />
                    <Legend wrapperStyle={{ fontSize: 14 }} />
                    <Bar dataKey="pre" fill="#93c5fd" radius={[8, 8, 0, 0]} name="Pre-Test" />
                    <Bar dataKey="post" fill="#10b981" radius={[8, 8, 0, 0]} name="Post-Test" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Recent assessments table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">All Assessments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-base">
                  <thead>
                    <tr className="border-b border-border text-left text-sm text-muted-foreground">
                      <th className="py-2 pr-4 font-medium">Child</th>
                      <th className="py-2 pr-4 font-medium">Club</th>
                      <th className="py-2 pr-4 font-medium">Type</th>
                      <th className="py-2 pr-4 font-medium">Score</th>
                      <th className="py-2 font-medium">Level</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.slice(0, 20).map((a) => (
                      <tr key={a.id} className="border-b border-border/50">
                        <td className="py-3 pr-4 font-medium">{a.child_name}</td>
                        <td className="py-3 pr-4 text-muted-foreground">{a.club_name}</td>
                        <td className="py-3 pr-4">
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                            a.test_type === 'pre' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'
                          }`}>
                            {a.test_type === 'pre' ? 'Pre' : 'Post'}
                          </span>
                        </td>
                        <td className="py-3 pr-4">{a.total_score}/{a.total_possible}</td>
                        <td className="py-3">{a.proficiency_level}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
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