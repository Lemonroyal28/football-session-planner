// config/agents.config.ts
// Football Session Planner Agent Configuration

export const agentConfigs = {
  sessionPlanner: {
    name: 'session-planner',
    model: 'sonnet',  // Complex reasoning for session design
    capabilities: ['session-design', 'drill-planning', 'timing-optimization'],
    timeout: 30000,
    memory_namespace: 'football/sessions'
  },
  squadAnalyzer: {
    name: 'squad-analyzer',
    model: 'sonnet',  // Detailed tactical analysis
    capabilities: ['player-profiling', 'squad-composition', 'role-assignment'],
    timeout: 25000,
    memory_namespace: 'football/squad'
  },
  tacticsGenerator: {
    name: 'tactics-generator',
    model: 'opus',  // Complex tactical decisions
    capabilities: ['formation-design', 'positioning', 'strategy-generation'],
    timeout: 35000,
    memory_namespace: 'football/tactics'
  },
  drillOptimizer: {
    name: 'drill-optimizer',
    model: 'haiku',  // Fast optimization
    capabilities: ['drill-sequencing', 'intensity-adjustment', 'rotation-planning'],
    timeout: 15000,
    memory_namespace: 'football/drills'
  },
  performanceTracker: {
    name: 'performance-tracker',
    model: 'haiku',  // Quick data processing
    capabilities: ['metric-calculation', 'progress-tracking', 'analytics'],
    timeout: 10000,
    memory_namespace: 'football/performance'
  }
};

export const swarmConfig = {
  topology: 'hierarchical',
  maxAgents: 8,
  strategy: 'specialized',
  consensus: 'raft',
  coordinatorType: 'session-orchestrator'
};

export const memoryConfig = {
  backend: 'hybrid',
  enableHNSW: true,
  namespaces: [
    'football/sessions',      // Training sessions
    'football/squad',         // Player and squad data
    'football/tactics',       // Tactical formations and strategies
    'football/drills',        // Drill patterns and exercises
    'football/performance',   // Performance metrics
    'football/patterns',      // Learned patterns
    'dev'                      // Development/testing
  ]
};

export const footballDomains = {
  sessionPlanning: {
    name: 'session-planning',
    context: 'Training session design and scheduling'
  },
  squadManagement: {
    name: 'squad-management',
    context: 'Player roles, formations, and positioning'
  },
  tacticalAnalysis: {
    name: 'tactical-analysis',
    context: 'Game strategy and tactical planning'
  },
  performance: {
    name: 'performance',
    context: 'Training metrics and progress tracking'
  }
};
