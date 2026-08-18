import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { prompt, model_answer } = body;

    if (!prompt || !model_answer) {
      return Response.json({ error: 'prompt and model_answer are required' }, { status: 400 });
    }

    const llmResponse = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `You are creating a multiple-choice pop quiz question for a volunteer training module in a children's reading program (kidsREAD).

SCENARIO PROMPT:
${prompt}

RECOMMENDED APPROACH (the best answer):
${model_answer}

Generate 3 multiple-choice options for how the volunteer should respond to this scenario. Exactly ONE option must match the recommended approach (mark it is_recommended: true). The other two options should be plausible but less effective approaches a volunteer might mistakenly take.

Return JSON with this exact structure:
{
  "options": [
    { "text": "concise option text", "is_recommended": true },
    { "text": "concise option text", "is_recommended": false },
    { "text": "concise option text", "is_recommended": false }
  ],
  "explanation": "A brief 2-3 sentence explanation of why the recommended approach is the best choice, written in plain encouraging language."
}

Requirements:
- Exactly one option has is_recommended: true
- The recommended option should capture the essence of the recommended approach, not copy it word-for-word
- Each option should be concise (1-2 sentences)
- Distractor options should be realistic mistakes, not obviously wrong
- The explanation should help the volunteer understand the reasoning`,
      response_json_schema: {
        type: 'object',
        properties: {
          options: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                text: { type: 'string' },
                is_recommended: { type: 'boolean' },
              },
              required: ['text', 'is_recommended'],
            },
          },
          explanation: { type: 'string' },
        },
        required: ['options', 'explanation'],
      },
      model: 'automatic',
    });

    return Response.json(llmResponse);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}