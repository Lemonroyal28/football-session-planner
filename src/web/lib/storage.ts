import type { Session, SessionMeta } from '../../types/session';

interface SessionListEntry {
  id: string;
  title: string;
  updated: string;
  tags: string[];
}

export function getSessionList(): SessionListEntry[] {
  try {
    const raw = localStorage.getItem('fsp_sessions');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveSession(session: Session): void {
  const full = JSON.stringify(session);
  localStorage.setItem(`fsp_session_${session.id}`, full);

  const list = getSessionList();
  const entry: SessionListEntry = {
    id: session.id,
    title: session.meta.title,
    updated: session.meta.updated,
    tags: session.meta.tags,
  };
  const idx = list.findIndex((e) => e.id === session.id);
  if (idx >= 0) list[idx] = entry;
  else list.unshift(entry);
  localStorage.setItem('fsp_sessions', JSON.stringify(list));
}

export function loadSession(id: string): Session | null {
  try {
    const raw = localStorage.getItem(`fsp_session_${id}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function deleteSession(id: string): void {
  localStorage.removeItem(`fsp_session_${id}`);
  const list = getSessionList().filter((e) => e.id !== id);
  localStorage.setItem('fsp_sessions', JSON.stringify(list));
}

export function loadDraft(): Session | null {
  try {
    const raw = localStorage.getItem('fsp_draft');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearDraft(): void {
  localStorage.removeItem('fsp_draft');
}
