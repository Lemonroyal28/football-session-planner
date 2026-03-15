'use client';

import { useEffect, useRef } from 'react';
import type { Session } from '../../types/session';

export function useAutosave(session: Session | null, delay = 5000) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!session) return;

    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      try {
        localStorage.setItem('fsp_draft', JSON.stringify(session));
      } catch {
        // storage full — silently ignore
      }
    }, delay);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [session, delay]);
}
