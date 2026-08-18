import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { calculateAssessmentResults } from "../../shared/assessmentConfig.ts";

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);

    const body = await req.json();
    const { test_type, child_name, club_name, answers, assessment_date } = body;

    // Validate required fields
    if (!test_type || !child_name || !club_name || !answers) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const today = assessment_date || new Date().toISOString().split('T')[0];

    // Calculate scores (prototype mode: no database write, no email)
    const results = calculateAssessmentResults(answers);

    return Response.json({
      assessment_date: today,
      ...results,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}