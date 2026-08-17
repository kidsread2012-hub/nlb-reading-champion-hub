import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import AssessmentRunner from '@/components/AssessmentRunner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ClipboardCheck, Plus, Loader2, FileText, Calendar, TrendingUp } from 'lucide-react';

export default function Assessment() {
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRunner, setShowRunner] = useState(false);
  const [recentAssessments, setRecentAssessments] = useState([]);

  useEffect(() => {
    async function loadData() {
      try {
        const [clubList, assessments] = await Promise.all([
          base44.entities.Club.list(),
          base44.entities.Assessment.list('-created_date', 5),
        ]);
        setClubs(clubList);
        setRecentAssessments(assessments);
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

  if (showRunner) {
    return <AssessmentRunner clubs={clubs} />;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 pb-24 md:pb-8">
      <div className="mb-8">
        <div className="w-14 h-14 rounded-2xl bg-amber-100 flex items-center justify-center mb-4">
          <ClipboardCheck className="w-7 h-7 text-amber-600" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Assessment Tool</h1>
        <p className="text-lg text-muted-foreground">
          Administer pre and post-tests to assess children's reading proficiency.
        </p>
      </div>

      {clubs.length === 0 ? (
        <Card className="mb-6 border-amber-200 bg-amber-50">
          <CardContent className="p-6">
            <p className="text-base text-amber-800">
              No clubs have been set up yet. Please contact your administrator to add clubs before running assessments.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Button
          size="lg"
          className="w-full text-lg h-14 mb-8"
          onClick={() => setShowRunner(true)}
        >
          <Plus className="w-5 h-5 mr-2" />
          Start New Assessment
        </Button>
      )}

      {/* Recent assessments */}
      {recentAssessments.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Recent Assessments</h2>
          <div className="space-y-3">
            {recentAssessments.map((a) => (
              <Card key={a.id}>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-lg">{a.child_name}</span>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        a.test_type === 'pre' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {a.test_type === 'pre' ? 'Pre-Test' : 'Post-Test'}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {a.club_name} · {a.proficiency_level} · {a.total_score}/{a.total_possible}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}