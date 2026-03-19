import { createClient } from '../../../lib/supabase/server';
import Link from 'next/link';
import { TemplateCard } from '../../../components/templates/template-card';

export default async function TemplatesPage({
  searchParams,
}: {
  searchParams: Promise<{ age_group?: string; level?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from('session_templates')
    .select('id, title, description, age_group, level, tags, duration_minutes, blocks, updated_at')
    .order('updated_at', { ascending: false });

  if (params.age_group) {
    query = query.eq('age_group', params.age_group);
  }
  if (params.level) {
    query = query.eq('level', params.level);
  }

  const { data: templates } = await query;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">Templates</h1>
      </div>

      <div className="flex gap-2 flex-wrap">
        {['U7-U10', 'U11-U14', 'U15-U18', 'Senior'].map((ag) => (
          <Link
            key={ag}
            href={params.age_group === ag ? '/templates' : `/templates?age_group=${ag}`}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              params.age_group === ag
                ? 'bg-emerald-600/20 text-emerald-400'
                : 'text-white/50 hover:text-white/70 hover:bg-white/5'
            }`}
          >
            {ag}
          </Link>
        ))}
        {['Beginner', 'Intermediate', 'Advanced'].map((lv) => (
          <Link
            key={lv}
            href={params.level === lv ? '/templates' : `/templates?level=${lv}`}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              params.level === lv
                ? 'bg-blue-500/20 text-blue-400'
                : 'text-white/50 hover:text-white/70 hover:bg-white/5'
            }`}
          >
            {lv}
          </Link>
        ))}
      </div>

      {templates && templates.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((t) => (
            <TemplateCard key={t.id} template={t} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-white/40 text-sm">No templates yet</p>
          <p className="text-white/30 text-xs mt-1">
            Save a session as a template from the session builder
          </p>
        </div>
      )}
    </div>
  );
}
