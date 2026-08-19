import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { ASSESSMENT_SECTIONS } from '@/lib/assessmentConfig';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Check, X, ArrowRight, ArrowLeft, Loader2, ClipboardCheck, MessageCircle } from 'lucide-react';
import { addAssessment } from '@/lib/localStore';

export default function AssessmentRunner({ clubs }) {
  const navigate = useNavigate();
  const [step, setStep] = useState(0); // 0 = metadata, 1..N = sections, N+1 = submitting
  const [metadata, setMetadata] = useState({
    test_type: 'pre',
    child_name: '',
    club_name: '',
    volunteer_email: '',
  });
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const totalSteps = ASSESSMENT_SECTIONS.length;
  const currentSection = ASSESSMENT_SECTIONS[step - 1];

  // Scroll to top whenever the step or result changes so each screen starts at the top
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [step, result]);

  const handleToggle = (sectionId, item, value) => {
    setAnswers((prev) => ({
      ...prev,
      [sectionId]: {
        ...(prev[sectionId] || {}),
        [item]: value,
      },
    }));
  };

  const canProceed = () => {
    if (step === 0) {
      return metadata.child_name.trim() && metadata.club_name;
    }
    if (currentSection) {
      const sectionAnswers = answers[currentSection.id] || {};
      return currentSection.items.every((item) => sectionAnswers[item] === true || sectionAnswers[item] === false);
    }
    return false;
  };

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const response = await base44.functions.invoke('processAssessment', {
        test_type: metadata.test_type,
        child_name: metadata.child_name.trim(),
        club_name: metadata.club_name,
        answers,
      });
      const data = response.data || response;
      const result = {
        ...data,
        total_score: data.totalScore ?? data.total_score,
        total_possible: data.totalPossible ?? data.total_possible,
        proficiency_level: data.proficiencyLevel ?? data.proficiency_level,
        competencies_needing_help: data.competenciesNeedingHelp ?? data.competencies_needing_help,
      };
      addAssessment({
        test_type: metadata.test_type,
        child_name: metadata.child_name.trim(),
        club_name: metadata.club_name,
        assessment_date: data.assessment_date || new Date().toISOString().split('T')[0],
        total_score: result.total_score,
        total_possible: result.total_possible,
        proficiency_level: result.proficiency_level,
        competencies_needing_help: result.competencies_needing_help,
      });
      setResult(result);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Results screen
  if (result) {
    return <AssessmentResult result={result} metadata={metadata} navigate={navigate} />;
  }

  // Metadata step
  if (step === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 pt-8 md:pt-12 pb-24 md:pb-8">
        <div className="mb-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <ClipboardCheck className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-2">New Assessment</h1>
          <p className="text-lg text-muted-foreground">Enter the child's details to begin the reading test.</p>
        </div>

        <Card>
          <CardContent className="p-6 md:p-8 space-y-6">
            <div>
              <Label className="text-base font-semibold mb-2 block">Test Type</Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setMetadata({ ...metadata, test_type: 'pre' })}
                  className={`p-4 rounded-xl border-2 text-center transition-all ${
                    metadata.test_type === 'pre'
                      ? 'border-primary bg-primary/5 text-primary font-semibold'
                      : 'border-border hover:border-primary/40'
                  }`}
                >
                  <span className="text-lg">Pre-Test</span>
                  <p className="text-sm text-muted-foreground mt-1">Baseline assessment</p>
                </button>
                <button
                  onClick={() => setMetadata({ ...metadata, test_type: 'post' })}
                  className={`p-4 rounded-xl border-2 text-center transition-all ${
                    metadata.test_type === 'post'
                      ? 'border-primary bg-primary/5 text-primary font-semibold'
                      : 'border-border hover:border-primary/40'
                  }`}
                >
                  <span className="text-lg">Post-Test</span>
                  <p className="text-sm text-muted-foreground mt-1">After intervention</p>
                </button>
              </div>
            </div>

            <div>
              <Label htmlFor="child_name" className="text-base font-semibold mb-2 block">Child's Name</Label>
              <Input
                id="child_name"
                value={metadata.child_name}
                onChange={(e) => setMetadata({ ...metadata, child_name: e.target.value })}
                placeholder="e.g. Sarah Chen"
                className="text-lg h-12"
              />
            </div>

            <div>
              <Label className="text-base font-semibold mb-2 block">Club</Label>
              <Select value={metadata.club_name} onValueChange={(val) => setMetadata({ ...metadata, club_name: val })}>
                <SelectTrigger className="text-lg h-12">
                  <SelectValue placeholder="Select a club" />
                </SelectTrigger>
                <SelectContent>
                  {clubs.map((club) => (
                    <SelectItem key={club.id} value={club.name} className="text-base">
                      {club.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="volunteer_email" className="text-base font-semibold mb-2 block">
                Your Email <span className="text-muted-foreground font-normal">(optional)</span>
              </Label>
              <Input
                id="volunteer_email"
                type="email"
                value={metadata.volunteer_email}
                onChange={(e) => setMetadata({ ...metadata, volunteer_email: e.target.value })}
                placeholder="e.g. yourname@example.com"
                className="text-lg h-12"
              />
            </div>

            {error && <p className="text-destructive text-sm">{error}</p>}

            <Button
              onClick={handleNext}
              disabled={!canProceed()}
              size="lg"
              className="w-full text-lg h-14"
            >
              Start Assessment
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Section steps
  if (submitting) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-4">
        <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
        <h2 className="text-xl font-semibold">Processing assessment...</h2>
        <p className="text-muted-foreground mt-1">Calculating scores...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 pt-6 md:pt-8 pb-24 md:pb-8">
      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-muted-foreground">
            Section {step} of {totalSteps}
          </span>
          <span className="text-sm font-medium text-muted-foreground">
            {Math.round((step / totalSteps) * 100)}% complete
          </span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-300"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* Section header */}
      <div className="mb-6 text-center">
        <h2 className="text-2xl md:text-3xl font-bold mb-1">{currentSection.name}</h2>
        <p className="text-base text-muted-foreground">
          {currentSection.subtitle} · Ask the child to read each word from left to right
        </p>
      </div>

      {/* Items grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
        {currentSection.items.map((item) => {
          const value = answers[currentSection.id]?.[item];
          return (
            <div
              key={item}
              className={`rounded-2xl border-2 p-4 text-center transition-all ${
                value === true
                  ? 'border-emerald-500 bg-emerald-50'
                  : value === false
                  ? 'border-destructive/40 bg-destructive/5'
                  : 'border-border bg-card'
              }`}
            >
              <span className="text-3xl md:text-4xl font-bold block mb-3 tracking-wide">{item}</span>
              <div className="flex gap-2 justify-center">
                <button
                  onClick={() => handleToggle(currentSection.id, item, true)}
                  className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                    value === true
                      ? 'bg-emerald-500 text-white'
                      : 'bg-muted text-muted-foreground hover:bg-emerald-100'
                  }`}
                  aria-label={`${item} correct`}
                >
                  <Check className="w-6 h-6" />
                </button>
                <button
                  onClick={() => handleToggle(currentSection.id, item, false)}
                  className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                    value === false
                      ? 'bg-destructive text-white'
                      : 'bg-muted text-muted-foreground hover:bg-destructive/10'
                  }`}
                  aria-label={`${item} incorrect`}
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-8 gap-3">
        <Button variant="outline" size="lg" onClick={handleBack} className="text-base w-full sm:w-auto">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </Button>
        <Button
          size="lg"
          onClick={handleNext}
          disabled={!canProceed()}
          className="text-base w-full sm:w-auto whitespace-normal break-words"
        >
          {step === totalSteps ? 'Submit Assessment' : 'Next Section'}
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </div>

      {error && <p className="text-destructive text-sm mt-4 text-center">{error}</p>}
    </div>
  );
}

function AssessmentResult({ result, metadata, navigate }) {
  const levelInfo = {
    'Level 1': { title: 'Level 1 — Foundation', color: 'emerald', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
    'Level 2': { title: 'Level 2 — Developing', color: 'amber', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
    'Level 3': { title: 'Level 3 — Proficient', color: 'blue', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  };
  const level = levelInfo[result.proficiency_level] || levelInfo['Level 1'];

  return (
    <div className="max-w-3xl mx-auto px-4 pt-8 md:pt-12 pb-24 md:pb-8">
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center mx-auto mb-4">
          <Check className="w-8 h-8 text-emerald-600" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Assessment Complete</h1>
        <p className="text-lg text-muted-foreground">
          {metadata.test_type === 'pre' ? 'Pre-Test' : 'Post-Test'} results for {metadata.child_name}
        </p>
      </div>

      {/* Score Card */}
      <Card className="mb-6">
        <CardContent className="p-6 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="text-center md:text-left">
              <p className="text-sm font-medium text-muted-foreground mb-1">Total Score</p>
              <p className="text-5xl font-bold text-primary">
                {result.total_score}<span className="text-2xl text-muted-foreground">/{result.total_possible}</span>
              </p>
            </div>
            <div className={`rounded-2xl ${level.bg} ${level.border} border-2 p-4 text-center`}>
              <p className="text-sm font-medium text-muted-foreground mb-1">Reading Proficiency</p>
              <p className={`text-2xl font-bold ${level.text}`}>{level.title}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Competencies */}
      {result.competencies_needing_help?.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-xl">Key Areas Needing Support</CardTitle>
            <CardDescription>Focus your coaching on these competencies:</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {result.competencies_needing_help.map((comp, i) => {
              const [sectionName, ...rest] = comp.split(' — ');
              const guidance = rest.join(' — ');
              return (
                <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-accent/10">
                  <span className="w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center font-bold text-sm shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-base font-semibold mb-0.5">{sectionName}</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">{guidance}</p>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Save notice */}
      <div className="rounded-xl bg-primary/5 border border-primary/20 p-4 mb-6 flex items-start gap-3">
        <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
          <Check className="w-3 h-3 text-primary" />
        </div>
        <p className="text-base text-foreground">
          Results saved on this device. Tap "Get Coaching Resources" for tailored activities.
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          size="lg"
          className="flex-1 text-base h-14"
          onClick={() =>
            navigate('/coach', {
              state: {
                assessmentContext: {
                  child_name: metadata.child_name,
                  club_name: metadata.club_name,
                  test_type: metadata.test_type,
                  total_score: result.total_score,
                  total_possible: result.total_possible,
                  proficiency_level: result.proficiency_level,
                  competencies_needing_help: result.competencies_needing_help,
                },
              },
            })
          }
        >
          <MessageCircle className="w-5 h-5 mr-2" />
          Get Coaching Resources
        </Button>
        <Button
          variant="outline"
          size="lg"
          className="flex-1 text-base h-14"
          onClick={() => navigate('/assessment')}
        >
          New Assessment
        </Button>
      </div>
    </div>
  );
}