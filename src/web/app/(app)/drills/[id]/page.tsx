import { createClient } from '../../../../lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Clock, Star, Edit } from 'lucide-react';

export default async function DrillDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: drill } = await supabase
    .from('drills')
    .select('*')
    .eq('id', id)
    .single();

  if (!drill) notFound();

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/drills" className="text-white/40 hover:text-white/70 transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white">{drill.title}</h1>
            {drill.is_favorite && <Star size={16} className="text-yellow-400 fill-yellow-400" />}
          </div>
          {drill.category && (
            <span className="inline-block mt-1 text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded">
              {drill.category}
            </span>
          )}
        </div>
      </div>

      {/* Meta info */}
      <div className="flex items-center gap-6 text-sm text-white/50">
        <span className="flex items-center gap-1">
          <Clock size={14} />
          {drill.duration_minutes} minutes
        </span>
        {drill.age_groups.length > 0 && (
          <span>Ages: {drill.age_groups.join(', ')}</span>
        )}
      </div>

      {/* Description */}
      {drill.description && (
        <div>
          <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-2">Description</h2>
          <p className="text-sm text-white/70 whitespace-pre-wrap">{drill.description}</p>
        </div>
      )}

      {/* Coaching points */}
      {drill.coaching_points.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-2">Coaching Points</h2>
          <ul className="space-y-1">
            {drill.coaching_points.map((cp: string, i: number) => (
              <li key={i} className="text-sm text-white/70 flex items-start gap-2">
                <span className="text-emerald-400 mt-1">&#8226;</span>
                {cp}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Equipment */}
      {drill.equipment.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-2">Equipment</h2>
          <div className="flex flex-wrap gap-2">
            {drill.equipment.map((eq: string, i: number) => (
              <span key={i} className="text-xs bg-white/5 text-white/60 px-2 py-1 rounded">
                {eq}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Tags */}
      {drill.tags.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-2">Tags</h2>
          <div className="flex flex-wrap gap-2">
            {drill.tags.map((tag: string, i: number) => (
              <span key={i} className="text-xs bg-white/5 text-white/40 px-2 py-1 rounded">
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
