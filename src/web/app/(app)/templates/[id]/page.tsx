import { createClient } from '../../../../lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Clock, FileStack } from 'lucide-react';
import { TemplateCard } from '../../../../components/templates/template-card';

export default async function TemplateDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: template } = await supabase
    .from('session_templates')
    .select('*')
    .eq('id', id)
    .single();

  if (!template) notFound();

  const blocks = (template.blocks || []) as Array<Record<string, unknown>>;

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/templates" className="text-white/40 hover:text-white/70 transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <h1 className="text-xl font-bold text-white">{template.title}</h1>
      </div>

      <div className="flex items-center gap-4 text-sm text-white/50">
        <span className="flex items-center gap-1">
          <Clock size={14} />
          {template.duration_minutes}min
        </span>
        <span>{blocks.length} blocks</span>
        {template.age_group && <span>{template.age_group}</span>}
        {template.level && <span>{template.level}</span>}
      </div>

      {template.description && (
        <p className="text-sm text-white/70">{template.description}</p>
      )}

      {/* Block preview */}
      <div className="space-y-2">
        <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider">Blocks</h2>
        {blocks.map((block, i) => (
          <div key={i} className="rounded-md bg-white/5 border border-white/10 px-4 py-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/80">{String(block.title || `Block ${i + 1}`)}</span>
              <span className="text-xs text-white/40">{String(block.duration_minutes || 15)}min</span>
            </div>
            {block.description ? (
              <p className="text-xs text-white/50 mt-1">{String(block.description)}</p>
            ) : null}
          </div>
        ))}
      </div>

      <TemplateCard template={template} />
    </div>
  );
}
