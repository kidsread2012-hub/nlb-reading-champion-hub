// Framework-agnostic prompt builder for the checkpoint pop-quiz generator.
// Pure function — no Base44 SDK, no Request/Response. The
// generateCheckpointOptions backend function imports this and supplies the
// result to its LLM call.

export function buildCheckpointPrompt(prompt: string, modelAnswer: string): string {
  return `You are creating a multiple-choice pop quiz question for a volunteer training module in a children's reading program (kidsREAD).

SCENARIO PROMPT:
${prompt}

RECOMMENDED APPROACH (the best answer):
${modelAnswer}

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
- The explanation should help the volunteer understand the reasoning`;
}

// JSON schema for the structured LLM response.
export const CHECKPOINT_RESPONSE_SCHEMA = {
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
};