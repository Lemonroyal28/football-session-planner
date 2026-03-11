// src/agents/SquadAnalyzerAgent.ts
// Squad analysis and player role assignment

export interface Player {
  id: string;
  name: string;
  position: string;
  number: number;
  skillLevel: 1 | 2 | 3 | 4 | 5; // 1=beginner, 5=expert
  strengths: string[];
  weaknesses: string[];
  preferredFoot: 'left' | 'right' | 'both';
  injuryStatus: 'fit' | 'recovering' | 'unavailable';
}

export interface SquadAnalysis {
  id: string;
  squad: Player[];
  formations: FormationOption[];
  playerRoles: Record<string, string>;
  recommendations: string[];
  analyzedAt: Date;
}

export interface FormationOption {
  name: string;
  description: string;
  suitability: number; // 1-10
  bestFor: string[];
}

export class SquadAnalyzerAgent {
  private name = 'SquadAnalyzer';

  async analyzeSquad(players: Player[]): Promise<SquadAnalysis> {
    console.log(`✓ ${this.name} analyzing squad of ${players.length} players`);

    const analysis: SquadAnalysis = {
      id: `analysis-${Date.now()}`,
      squad: players,
      formations: this.suggestFormations(players),
      playerRoles: this.assignRoles(players),
      recommendations: this.generateRecommendations(players),
      analyzedAt: new Date()
    };

    await this.storeAnalysis(analysis);
    return analysis;
  }

  private suggestFormations(players: Player[]): FormationOption[] {
    const fitPlayers = players.filter(p => p.injuryStatus === 'fit');
    const skillLevel = this.getAverageSkill(fitPlayers);

    const formations: FormationOption[] = [];

    // Defensive formation
    formations.push({
      name: '4-4-2 (Defensive)',
      description: 'Solid defensive shape with two strikers',
      suitability: skillLevel < 3 ? 8 : 5,
      bestFor: ['Defending', 'Set pieces']
    });

    // Balanced formation
    formations.push({
      name: '4-3-3 (Balanced)',
      description: 'Balanced formation with three midfielders',
      suitability: skillLevel >= 3 ? 8 : 6,
      bestFor: ['Possession', 'Transition']
    });

    // Attacking formation
    formations.push({
      name: '3-5-2 (Attacking)',
      description: 'Attacking shape with wing-backs',
      suitability: skillLevel > 3 ? 8 : 4,
      bestFor: ['Attacking', 'Pace']
    });

    return formations.sort((a, b) => b.suitability - a.suitability);
  }

  private assignRoles(players: Player[]): Record<string, string> {
    const roles: Record<string, string> = {};

    players.forEach(player => {
      if (player.injuryStatus !== 'fit') {
        roles[player.name] = 'Unavailable';
        return;
      }

      // Simple role assignment based on position
      if (player.position === 'GK') {
        roles[player.name] = 'Goalkeeper';
      } else if (['CB', 'RB', 'LB'].includes(player.position)) {
        roles[player.name] = 'Defender - ' + player.position;
      } else if (['CM', 'CAM', 'CDM'].includes(player.position)) {
        roles[player.name] = 'Midfielder - ' + player.position;
      } else if (['RW', 'LW', 'ST'].includes(player.position)) {
        roles[player.name] = 'Attacker - ' + player.position;
      }
    });

    return roles;
  }

  private generateRecommendations(players: Player[]): string[] {
    const recommendations: string[] = [];
    const fitCount = players.filter(p => p.injuryStatus === 'fit').length;

    if (fitCount < 11) {
      recommendations.push(
        `Only ${fitCount} fit players available. Consider modified game or wait for recovery.`
      );
    }

    const defensiveCount = players.filter(
      p => ['CB', 'RB', 'LB'].includes(p.position) && p.injuryStatus === 'fit'
    ).length;

    if (defensiveCount < 4) {
      recommendations.push('Limited defensive depth. Consider using midfielder as defender.');
    }

    const strikerCount = players.filter(
      p => p.position === 'ST' && p.injuryStatus === 'fit'
    ).length;

    if (strikerCount < 2) {
      recommendations.push('Limited striking options. Train wingers on striker positioning.');
    }

    if (recommendations.length === 0) {
      recommendations.push('Squad looks well-balanced. Ready for match preparation.');
    }

    return recommendations;
  }

  private getAverageSkill(players: Player[]): number {
    if (players.length === 0) return 1;
    const sum = players.reduce((acc, p) => acc + p.skillLevel, 0);
    return sum / players.length;
  }

  private async storeAnalysis(analysis: SquadAnalysis): Promise<void> {
    console.log(`✓ Squad analysis stored with ${analysis.squad.length} players`);
  }

  async learn(feedback: any): Promise<void> {
    console.log(`✓ Learning from squad feedback:`, feedback);
  }
}
