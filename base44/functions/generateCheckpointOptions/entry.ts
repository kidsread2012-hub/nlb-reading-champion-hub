import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { buildCheckpointPrompt, CHECKPOINT_RESPONSE_SCHEMA } from "../../shared/checkpointPrompts.ts";

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);

    const body = await req.json();
    const { prompt, model_answer } = body;

    if (!prompt || !model_answer) {
      return Response.json({ error: 'prompt and model_answer are required' }, { status: 400 });
    }

    const llmResponse = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: buildCheckpointPrompt(prompt, model_answer),
      response_json_schema: CHECKPOINT_RESPONSE_SCHEMA,
      model: 'automatic',
    });

    return Response.json(llmResponse);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}