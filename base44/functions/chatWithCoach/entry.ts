import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { message, conversation_history, assessment_context, practice_context } = body;

    if (!message) {
      return Response.json({ error: 'Message is required' }, { status: 400 });
    }

    // Build system prompt
    const systemPrompt = buildSystemPrompt(assessment_context, practice_context);

    // Build conversation messages for the LLM
    const messages = [{ role: 'system', content: systemPrompt }];

    if (conversation_history && Array.isArray(conversation_history)) {
      for (const msg of conversation_history.slice(-10)) {
        messages.push({ role: msg.role, content: msg.content });
      }
    }
    messages.push({ role: 'user', content: message });

    // Call LLM
    const llmResponse = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: messages.map(m => `${m.role === 'user' ? 'Volunteer' : 'Coach'}: ${m.content}`).join('\n\n'),
      model: 'automatic',
    });

    const responseText = typeof llmResponse === 'string' ? llmResponse : JSON.stringify(llmResponse);

    // Save conversation to database
    await base44.entities.CoachConversation.create({
      role: 'user',
      content: message,
      assessment_context: assessment_context || practice_context || null,
    });
    await base44.entities.CoachConversation.create({
      role: 'assistant',
      content: responseText,
      assessment_context: assessment_context || practice_context || null,
    });

    return Response.json({ response: responseText });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

function buildSystemPrompt(assessmentContext: any, practiceContext: any): string {
  if (practiceContext) {
    return `You are role-playing as a young child in a kidsREAD reading session. This is a PRACTICE session for the volunteer to build confidence before working with real children.

SCENARIO: ${practiceContext.scenario_prompt}

CRITICAL RULES:
- Stay in character as the child at ALL TIMES. Never break character, never say you are an AI or a language model.
- Respond as a real ${practiceContext.child_age || '5'}-year-old child would: short, simple sentences.
- Make realistic mistakes a child that age would make — mixing up sounds, guessing words, getting distracted, going off-topic.
- React to what the volunteer actually says or does. If they teach a sound, try to say it back. If they read a story, react to it.
- Keep each reply brief (1-3 short sentences).
- Only step out of character if the volunteer says "pause practice" or "end role-play".`;
  }

  let prompt = `You are the AI Learning Coach for the NLB Volunteer Learning Hub — a platform for "Reading Champions" volunteers who support children in the kidsREAD reading program.

Your role is to provide personalised, contextual guidance to volunteers on how to coach children in reading and phonics.

Guidelines:
- Be warm, encouraging, and practical
- Give specific, actionable strategies the volunteer can use in their next reading session
- Reference phonics concepts: letter sounds, blending, tricky words, reading proficiency levels (Level 1 = foundation, Level 2 = developing, Level 3 = proficient)
- Suggest concrete activities, games, and exercises
- Keep responses concise but thorough (3-5 paragraphs max)
- If the volunteer asks about a specific child's assessment results, use the provided context to give targeted advice`;

  if (assessmentContext) {
    prompt += `

CURRENT ASSESSMENT CONTEXT:
- Child: ${assessmentContext.child_name || 'N/A'}
- Club: ${assessmentContext.club_name || 'N/A'}
- Test Type: ${assessmentContext.test_type === 'pre' ? 'Pre-Test' : 'Post-Test'}
- Total Score: ${assessmentContext.total_score}/${assessmentContext.total_possible}
- Proficiency Level: ${assessmentContext.proficiency_level}
- Competencies Needing Help: ${(assessmentContext.competencies_needing_help || []).join(', ') || 'None'}

Tailor your coaching advice to this child's specific results. Focus on the areas where the child needs help, and suggest activities appropriate for their proficiency level.`;
  }

  return prompt;
}