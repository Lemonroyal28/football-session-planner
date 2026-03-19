'use client';

import { useRouter } from 'next/navigation';
import { createClient } from '../../lib/supabase/client';
import { Clock, FileStack, Play } from 'lucide-react';

interface TemplateCardProps {
  template: {
    id: string;
    title: string;
    description: string;
    age_group: string | null;
    level: string | null;
    tags: string[];
    duration_minutes: number;
    blocks: unknown[];
  };
}

export function TemplateCard({ template }: TemplateCardProps) {
  const router = useRouter();

  const handleUseTemplate = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Create a new session from this template
    const { data: session } = await supabase
      .from('sessions')
      .insert({
        user_id: user?.id ?? null,
        title: `${template.title} (copy)`,
        duration_minutes: template.duration_minutes,
        age_group: template.age_group,
        status: 'draft',
      })
      .select('id')
      .single();

    if (!session) return;

    // Create blocks from template
    const blocks = (template.blocks as Array<Record<string, unknown>>).map((block, i) => ({
      session_id: session.id,
      order_index: i,
      block_type: block.block_type || 'drill',
      title: block.title || '',
      duration_minutes: block.duration_minutes || 15,
      description: block.description || '',
      coaching_points: block.coaching_points || [],
      equipment: block.equipment || [],
      intensity: block.intensity || 'medium',
      notes: block.notes || {},
    }));

    if (blocks.length > 0) {
      await supabase.from('session_blocks').insert(blocks);
    }

    router.push(`/sessions/${session.id}`);
  };

  const blockCount = Array.isArray(template.blocks) ? template.blocks.length : 0;

  return (
    <div className="rounded-lg bg-white/5 border border-white/10 p-4 flex flex-col">
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="text-sm font-medium text-white">{template.title}</h3>
        <FileStack size={16} className="text-white/30 shrink-0" />
      </div>

      {template.description && (
        <p className="text-xs text-white/50 mb-3 line-clamp-2">{template.description}</p>
      )}

      <div className="flex items-center gap-3 text-xs text-white/40 mb-3">
        <span className="flex items-center gap-1">
          <Clock size={12} />
          {template.duration_minutes}min
        </span>
        <span>{blockCount} blocks</span>
        {template.age_group && <span>{template.age_group}</span>}
        {template.level && <span>{template.level}</span>}
      </div>

      {template.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {template.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="text-xs bg-white/5 text-white/40 px-1.5 py-0.5 rounded">{tag}</span>
          ))}
        </div>
      )}

      <button
        onClick={handleUseTemplate}
        className="mt-auto flex items-center justify-center gap-2 rounded-md bg-emerald-600/20 border border-emerald-500/30 px-3 py-2 text-sm text-emerald-400 hover:bg-emerald-600/30 transition-colors"
      >
        <Play size={14} />
        Use This Template
      </button>
    </div>
  );
}
