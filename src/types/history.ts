import type { ScreenState } from './canvas';

export interface HistoryEntry {
  state: ScreenState;
  timestamp: number;
}
