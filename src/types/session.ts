import type { PitchType } from './pitch';
import type { ScreenState } from './canvas';
import type { ScreenNotes } from './notes';

export interface Screen {
  id: string;
  name: string;
  pitchType: PitchType;
  state: ScreenState;
  notes: ScreenNotes;
}

export interface SessionMeta {
  title: string;
  author: string;
  club: string;
  created: string;
  updated: string;
  tags: string[];
  category: string;
  skillLevel: string;
}

export interface Session {
  id: string;
  version: string;
  meta: SessionMeta;
  screens: Screen[];
}
