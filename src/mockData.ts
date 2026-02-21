import { Team } from './types';

export const MOCK_TEAMS: Team[] = [
  {
    id: '1',
    name: 'Research & Content Team',
    objective: 'Generate a 500-word blog post about Quantum Computing for beginners.',
    agents: [
      {
        id: 'agent-1',
        role: 'Researcher',
        status: 'done',
        summary: 'Gathered key facts about Quantum Bits and Superposition.',
        tokensUsed: 1200,
        logs: [
          'Searching for quantum computing basics...',
          'Found 5 sources.',
          'Synthesizing data.',
        ],
      },
      {
        id: 'agent-2',
        role: 'Writer',
        status: 'working',
        summary: 'Drafting the introduction and main sections.',
        tokensUsed: 800,
        logs: ['Starting draft...', 'Writing about qubits.'],
      },
    ],
    connections: [{ source: 'agent-1', target: 'agent-2' }],
  },
  {
    id: '2',
    name: 'Code Review Squad',
    objective: 'Review the pull request for the new authentication module.',
    agents: [
      {
        id: 'agent-3',
        role: 'Linter',
        status: 'done',
        summary: 'Checked for syntax errors and style violations.',
        tokensUsed: 400,
        logs: ['Running ESLint...', 'No critical errors found.'],
      },
      {
        id: 'agent-4',
        role: 'Security Auditor',
        status: 'waiting_approval',
        summary: 'Flagged a potential ReDoS in the email regex.',
        tokensUsed: 650,
        logs: ['Scanning for vulnerabilities...', 'Flagged email regex for review.'],
      },
    ],
    connections: [{ source: 'agent-3', target: 'agent-4' }],
  },
  {
    id: '3',
    name: 'Release Manager',
    objective: 'Coordinate the deployment of v2.1.0.',
    agents: [
      {
        id: 'agent-5',
        role: 'DevOps',
        status: 'done',
        summary: 'Prepared the staging environment.',
        tokensUsed: 300,
        logs: ['Staging ready.', 'Health checks passed.'],
      },
    ],
    connections: [],
  },
];

export const PREDEFINED_PERSONAS = [
  { name: 'Researcher', avatar: '🔍', systemPrompt: 'You are an expert researcher...' },
  { name: 'Coder', avatar: '💻', systemPrompt: 'You are an expert software engineer...' },
  { name: 'Reviewer', avatar: '🧐', systemPrompt: 'You are an expert code reviewer...' },
];
