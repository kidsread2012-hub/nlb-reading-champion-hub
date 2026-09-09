import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { buildCoachSystemPrompt } from "../../shared/coachPrompts.ts";

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);

    const body = await req.json();
    const { message, conversation_history, assessment_context, practice_context } = body;

    if (!message) {
      return Response.json({ error: 'Message is required' }, { status: 400 });
    }

    // Load the kidsREAD knowledge base (if any has been ingested)
    let knowledgeText = '';
    try {
      const records = await base44.asServiceRole.entities.CoachKnowledge.list('created_date', 100);
      if (records && records.length > 0) {
        knowledgeText = records
          .map((r) => `### ${r.title}\nSource: ${r.source || 'N/A'} | Category: ${r.category}\n${r.content}`)
          .join('\n\n---\n\n');
      }
    } catch (e) {
      // ignore — coach still works without an ingested knowledge base
    }

    const systemPrompt = buildCoachSystemPrompt(assessment_context, practice_context, knowledgeText);

    const convoLines = [];
    if (conversation_history && Array.isArray(conversation_history)) {
      for (const msg of conversation_history.slice(-10)) {
        convoLines.push(`${msg.role === 'user' ? 'Volunteer' : 'Coach'}: ${msg.content}`);
      }
    }
    convoLines.push(`Volunteer: ${message}`);

    const fullPrompt = `${systemPrompt}\n\n${convoLines.join('\n\n')}\n\nCoach:`;

    const llmResponse = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: fullPrompt,
      model: 'automatic',
    });

    const responseText = typeof llmResponse === 'string' ? llmResponse : JSON.stringify(llmResponse);

    // Prototype mode: no database persistence — the client stores the
    // conversation in localStorage on the volunteer's device.
    return Response.json({ response: responseText });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}