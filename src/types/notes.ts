export interface ScreenNotes {
  organisation: string;
  objective: string;
  instructions: string;
  progressions: string[];
  keyIdeas: string[];
  defendingPoints: string[];
  attackingPoints: string[];
  scoring: string;
}

export function emptyNotes(): ScreenNotes {
  return {
    organisation: '',
    objective: '',
    instructions: '',
    progressions: [],
    keyIdeas: [],
    defendingPoints: [],
    attackingPoints: [],
    scoring: '',
  };
}
