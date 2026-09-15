import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Admin access required' }, { status: 403 });

    const body = await req.json();
    const { file_url, title, source, category, part_labels } = body;
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

    // Group sections into parts that stay under the field size limit (~12000 chars per part for safety).
    const MAX_PART_CHARS = 12000;
    const parts: { label: string; content: string }[] = [];
    let currentChunks: string[] = [];
    let currentLen = 0;

    const flush = (label: string) => {
      if (currentChunks.length > 0) {
        parts.push({ label, content: currentChunks.join('\n\n') });
        currentChunks = [];
        currentLen = 0;
      }
    };

    for (const s of sections) {
      const block = s.heading ? `## ${s.heading}\n${s.body || ''}` : s.body || '';
      if (currentLen + block.length > MAX_PART_CHARS && currentChunks.length > 0) {
        flush(`Part ${parts.length + 1}`);
      }
      currentChunks.push(block);
      currentLen += block.length + 2;
    }
    flush(`Part ${parts.length + 1}`);

    // Override labels if custom part_labels provided
    const labels = Array.isArray(part_labels) && part_labels.length === parts.length
      ? part_labels
      : parts.map((p, i) => p.label);

    const created = [];
    for (let i = 0; i < parts.length; i++) {
      const partTitle = parts.length === 1 ? title : `${title} — ${labels[i]}`;
      const record = await base44.asServiceRole.entities.CoachKnowledge.create({
        title: partTitle,
        source: source || '',
        category,
        content: parts[i].content,
      });
      created.push({ id: record.id, title: partTitle, length: parts[i].content.length });
    }

    return Response.json({ created, parts: parts.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}