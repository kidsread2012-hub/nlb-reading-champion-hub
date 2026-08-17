import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Admin access required' }, { status: 403 });

    const body = await req.json();
    const { file_url, title, source, category } = body;
    if (!file_url || !title || !category) {
      return Response.json({ error: 'file_url, title and category are required' }, { status: 400 });
    }

    const extract = await base44.asServiceRole.integrations.Core.ExtractDataFromUploadedFile({
      file_url,
      json_schema: {
        type: 'object',
        properties: {
          sections: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                heading: { type: 'string' },
                body: { type: 'string' },
              },
            },
          },
        },
        required: ['sections'],
      },
    });

    if (extract.status !== 'success' || !extract.output) {
      return Response.json({ error: extract.details || 'Extraction failed' }, { status: 422 });
    }

    const sections = Array.isArray(extract.output) ? extract.output : extract.output.sections || [];
    const content = sections
      .map((s) => (s.heading ? `## ${s.heading}\n${s.body || ''}` : s.body || ''))
      .join('\n\n');

    const record = await base44.asServiceRole.entities.CoachKnowledge.create({
      title,
      source: source || '',
      category,
      content,
    });

    return Response.json({ created: { id: record.id, title, category, length: content.length } });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}