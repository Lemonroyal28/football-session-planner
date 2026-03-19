'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '../../../../lib/supabase/client';
import { useSessionBuilderStore } from '../../../../store/session-builder-store';
import { SessionBuilder } from '../../../../components/session-builder/session-builder';

export default function SessionBuilderPage() {
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const { setSession, setBlocks } = useSessionBuilderStore();

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const id = params.id as string;

      const { data: session } = await supabase
        .from('sessions')
        .select('*')
        .eq('id', id)
        .single();

      if (session) {
        setSession(session);

        const { data: blocks } = await supabase
          .from('session_blocks')
          .select('*')
          .eq('session_id', id)
          .order('order_index');

        if (blocks) setBlocks(blocks);
      }

      setLoading(false);
    };

    load();
  }, [params.id, setSession, setBlocks]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-white/40 text-sm">Loading session...</p>
      </div>
    );
  }

  return <SessionBuilder />;
}
