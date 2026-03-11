// src/examples/basic-usage.ts
// Basic usage example of Football Session Planner agents

import { SessionPlannerAgent } from '../agents/SessionPlannerAgent.js';
import { SquadAnalyzerAgent } from '../agents/SquadAnalyzerAgent.js';
import { TacticsGeneratorAgent } from '../agents/TacticsGeneratorAgent.js';

// Example 1: Plan a training session
async function planTrainingSession() {
  const planner = new SessionPlannerAgent();

  const session = await planner.planSession({
    teamSize: 16,
    focusAreas: ['possession', 'finishing', 'defense'],
    duration: 90,
    level: 'amateur'
  });

  console.log('Session Plan:');
  console.log(`Title: ${session.title}`);
  console.log(`Duration: ${session.duration} minutes`);
  console.log(`Drills: ${session.drills.length}`);
  session.drills.forEach(drill => {
    console.log(`  - ${drill.name} (${drill.duration}min, ${drill.intensity})`);
  });

  return session;
}

// Example 2: Analyze squad composition
async function analyzeSquadComposition() {
  const analyzer = new SquadAnalyzerAgent();

  // Sample squad
  const squad = [
    {
      id: '1',
      name: 'John (GK)',
      position: 'GK',
      number: 1,
      skillLevel: 4,
      strengths: ['Distribution', 'Shot-stopping'],
      weaknesses: ['Speed'],
      preferredFoot: 'right',
      injuryStatus: 'fit'
    },
    {
      id: '2',
      name: 'Mike (CB)',
      position: 'CB',
      number: 4,
      skillLevel: 4,
      strengths: ['Positioning', 'Aerial'],
      weaknesses: ['Speed'],
      preferredFoot: 'right',
      injuryStatus: 'fit'
    },
    {
      id: '3',
      name: 'Alex (RB)',
      position: 'RB',
      number: 2,
      skillLevel: 3,
      strengths: ['Pace', 'Crossing'],
      weaknesses: ['Defensive positioning'],
      preferredFoot: 'right',
      injuryStatus: 'fit'
    },
    {
      id: '4',
      name: 'Sarah (ST)',
      position: 'ST',
      number: 9,
      skillLevel: 5,
      strengths: ['Finishing', 'Movement'],
      weaknesses: [],
      preferredFoot: 'both',
      injuryStatus: 'fit'
    }
  ];

  const analysis = await analyzer.analyzeSquad(squad);

  console.log('\nSquad Analysis:');
  console.log(`Players analyzed: ${analysis.squad.length}`);
  console.log(`Suggested formations:`);
  analysis.formations.forEach(f => {
    console.log(`  - ${f.name} (Suitability: ${f.suitability}/10)`);
  });
  console.log(`Recommendations:`);
  analysis.recommendations.forEach(r => console.log(`  - ${r}`));

  return analysis;
}

// Example 3: Generate tactical plan
async function generateTactics() {
  const tacGen = new TacticsGeneratorAgent();

  const tactics = await tacGen.generateTactics({
    formation: '4-3-3',
    opposition: 'pressing-high',
    objectives: ['possession', 'control'],
    team: []
  });

  console.log('\nTactical Plan:');
  console.log(`Formation: ${tactics.formation}`);
  console.log(`Key principles:`);
  tactics.keyPrinciples.forEach(p => console.log(`  - ${p}`));
  console.log(`Defensive strategy: ${tactics.defensiveStrategy}`);
  console.log(`Offensive strategy: ${tactics.offensiveStrategy}`);

  return tactics;
}

// Main execution
async function main() {
  console.log('🚀 Football Session Planner - Basic Usage\n');

  try {
    // Run examples in sequence
    const session = await planTrainingSession();
    const analysis = await analyzeSquadComposition();
    const tactics = await generateTactics();

    console.log('\n✅ All examples completed successfully!');
    console.log('✨ Use the agents in your Claude Code session for more advanced planning.');
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { planTrainingSession, analyzeSquadComposition, generateTactics };
