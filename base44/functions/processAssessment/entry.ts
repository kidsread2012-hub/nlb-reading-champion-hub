import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { calculateAssessmentResults, ASSESSMENT_SECTIONS } from "../../shared/assessmentConfig.ts";

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { test_type, child_name, club_name, answers, assessment_date } = body;

    // Validate required fields
    if (!test_type || !child_name || !club_name || !answers) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const volunteerName = user.full_name || user.email || 'Volunteer';
    const volunteerEmail = user.email || '';
    const today = assessment_date || new Date().toISOString().split('T')[0];

    // Calculate scores
    const results = calculateAssessmentResults(answers);

    // Save assessment to database
    const assessment = await base44.entities.Assessment.create({
      test_type,
      assessment_date: today,
      volunteer_name: volunteerName,
      volunteer_email: volunteerEmail,
      child_name,
      club_name,
      answers,
      section_scores: results.sectionScores,
      total_score: results.totalScore,
      total_possible: results.totalPossible,
      proficiency_level: results.proficiencyLevel,
      competencies_needing_help: results.competenciesNeedingHelp,
    });

    // Send summary email to volunteer
    if (volunteerEmail) {
      const emailBody = buildEmailBody({
        test_type,
        child_name,
        club_name,
        assessment_date: today,
        volunteerName,
        ...results,
      });

      try {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: volunteerEmail,
          subject: `kidsREAD ${test_type === 'pre' ? 'Pre' : 'Post'}-Test Results — ${child_name} (${club_name})`,
          body: emailBody,
        });
      } catch (emailErr) {
        // Email failure should not block the assessment result
        console.error('Email send failed:', emailErr.message);
      }
    }

    return Response.json({
      assessment_id: assessment.id,
      ...results,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

function buildEmailBody(data: any): string {
  const { test_type, child_name, club_name, assessment_date, volunteerName, totalScore, totalPossible, proficiencyLevel, competenciesNeedingHelp, sectionScores } = data;
  const testLabel = test_type === 'pre' ? 'Pre-Test' : 'Post-Test';

  let sectionRows = '';
  for (const section of ASSESSMENT_SECTIONS) {
    const score = sectionScores[section.id];
    if (score) {
      const status = score.passed ? '✓ PASS' : '✗ NEEDS HELP';
      sectionRows += `${section.name}: ${score.correct}/${score.total} — ${status}\n`;
    }
  }

  const competencies = competenciesNeedingHelp.length > 0
    ? competenciesNeedingHelp.map((c: string, i: number) => `${i + 1}. ${c}`).join('\n')
    : 'None — the child passed all sections!';

  return `Dear ${volunteerName},

Here is the summary of the ${testLabel} assessment you administered:

CHILD: ${child_name}
CLUB: ${club_name}
DATE: ${assessment_date}

═══════════════════════════════════
  ASSESSMENT RESULTS
═══════════════════════════════════

TOTAL SCORE: ${totalScore} / ${totalPossible}

READING PROFICIENCY LEVEL: ${proficiencyLevel}

SECTION BREAKDOWN:
${sectionRows}
KEY COMPETENCIES NEEDING HELP:
${competencies}

═══════════════════════════════════

Visit the AI Learning Coach in the Volunteer Learning Hub to generate personalised coaching resources and activities for ${child_name}.

— NLB Volunteer Learning Hub`;
}