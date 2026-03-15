'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { loadSession } from '../../../lib/storage';
import { useSessionStore } from '../../../store/session-store';

export default function SessionEditorPage() {
  const params = useParams();
  const router = useRouter();
  const { setSession } = useSessionStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const id = params.id as string;
    const session = loadSession(id);
    if (session) {
      setSession(session);
      router.replace('/');
    } else {
      router.replace('/');
    }
    setLoading(false);
  }, [params.id, setSession, router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-white/60">Loading session...</p>
      </div>
    );
  }

  return null;
}
