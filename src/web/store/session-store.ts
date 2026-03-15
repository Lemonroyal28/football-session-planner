'use client';

import { create } from 'zustand';
import type { Session, Screen } from '../../types/session';
import type { PitchType } from '../../types/pitch';
import type { ScreenNotes } from '../../types/notes';
import type { ScreenState } from '../../types/canvas';
import { emptyNotes } from '../../types/notes';
import { createSession, createScreen, createEmptyScreenState } from '../lib/default-session';
import { newId } from '../lib/id';

interface SessionStore {
  session: Session;
  activeScreenIndex: number;

  // Session
  setSession: (session: Session) => void;
  updateMeta: (updates: Partial<Session['meta']>) => void;

  // Screens
  setActiveScreen: (index: number) => void;
  addScreen: () => void;
  removeScreen: (index: number) => void;
  renameScreen: (index: number, name: string) => void;
  setPitchType: (index: number, type: PitchType) => void;

  // Screen state
  updateScreenState: (index: number, state: ScreenState) => void;
  updateScreenNotes: (index: number, notes: ScreenNotes) => void;

  // Current screen helpers
  currentScreen: () => Screen;
  currentState: () => ScreenState;
  currentNotes: () => ScreenNotes;
}

export const useSessionStore = create<SessionStore>((set, get) => ({
  session: createSession(),
  activeScreenIndex: 0,

  setSession: (session) => set({ session, activeScreenIndex: 0 }),

  updateMeta: (updates) =>
    set((s) => ({
      session: {
        ...s.session,
        meta: { ...s.session.meta, ...updates, updated: new Date().toISOString() },
      },
    })),

  setActiveScreen: (index) => set({ activeScreenIndex: index }),

  addScreen: () =>
    set((s) => {
      const screen = createScreen(`Phase ${s.session.screens.length + 1}`);
      return {
        session: { ...s.session, screens: [...s.session.screens, screen] },
        activeScreenIndex: s.session.screens.length,
      };
    }),

  removeScreen: (index) =>
    set((s) => {
      if (s.session.screens.length <= 1) return s;
      const screens = s.session.screens.filter((_, i) => i !== index);
      const newIndex = Math.min(s.activeScreenIndex, screens.length - 1);
      return {
        session: { ...s.session, screens },
        activeScreenIndex: newIndex,
      };
    }),

  renameScreen: (index, name) =>
    set((s) => {
      const screens = s.session.screens.map((sc, i) =>
        i === index ? { ...sc, name } : sc
      );
      return { session: { ...s.session, screens } };
    }),

  setPitchType: (index, type) =>
    set((s) => {
      const screens = s.session.screens.map((sc, i) =>
        i === index ? { ...sc, pitchType: type } : sc
      );
      return { session: { ...s.session, screens } };
    }),

  updateScreenState: (index, state) =>
    set((s) => {
      const screens = s.session.screens.map((sc, i) =>
        i === index ? { ...sc, state } : sc
      );
      return { session: { ...s.session, screens } };
    }),

  updateScreenNotes: (index, notes) =>
    set((s) => {
      const screens = s.session.screens.map((sc, i) =>
        i === index ? { ...sc, notes } : sc
      );
      return { session: { ...s.session, screens } };
    }),

  currentScreen: () => {
    const s = get();
    return s.session.screens[s.activeScreenIndex];
  },

  currentState: () => {
    const s = get();
    return s.session.screens[s.activeScreenIndex].state;
  },

  currentNotes: () => {
    const s = get();
    return s.session.screens[s.activeScreenIndex].notes;
  },
}));
