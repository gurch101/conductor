import type { Team } from './types';
import { AgentStatus } from './constants/agentStatus';

export const MOCK_TEAMS: Team[] = [
  {
    id: '1',
    name: 'Research & Content Team',
    objective: 'Generate a 500-word blog post about Quantum Computing for beginners.',
    agents: [
      {
        id: 'agent-1',
        team_id: '1',
        description: 'Researcher',
        status: AgentStatus.Done,
        summary: 'Gathered key facts about Quantum Bits and Superposition.',
        tokensUsed: 1200,
        input_schema: [],
        output_schema: [],
        logs: [
          'Searching for quantum computing basics...',
          'Found 5 sources.',
          'Synthesizing data.',
        ],
      },
      {
        id: 'agent-2',
        team_id: '1',
        description: 'Writer',
        status: AgentStatus.Working,
        summary: 'Drafting the introduction and main sections.',
        tokensUsed: 800,
        input_schema: [],
        output_schema: [],
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
        team_id: '2',
        description: 'Linter',
        status: AgentStatus.Done,
        summary: 'Checked for syntax errors and style violations.',
        tokensUsed: 400,
        input_schema: [],
        output_schema: [],
        logs: ['Running ESLint...', 'No critical errors found.'],
      },
      {
        id: 'agent-4',
        team_id: '2',
        description: 'Security Auditor',
        status: AgentStatus.WaitingForFeedback,
        summary: 'Flagged a potential ReDoS in the email regex.',
        tokensUsed: 650,
        input_schema: [],
        output_schema: [],
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
        team_id: '3',
        description: 'DevOps',
        status: AgentStatus.Done,
        summary: 'Prepared the staging environment.',
        tokensUsed: 300,
        input_schema: [],
        output_schema: [],
        logs: ['Staging ready.', 'Health checks passed.'],
      },
    ],
    connections: [],
  },
];

export const PREDEFINED_PERSONAS = [
  {
    name: 'Product Manager',
    avatar: '📌',
    description: 'Leads discovery and produces PRD.',
    skill: 'product-owner-discovery-spec',
  },
  {
    name: 'Business Analyst (BA)',
    avatar: '📊',
    description: 'Translates high-level requirements in the PRD to detailed requirements.',
    skill: 'product-owner-discovery-spec',
  },
  {
    name: 'Solutions Architect',
    avatar: '🏗️',
    description: 'Defines how software will be structured to meet requirements.',
    skill: 'solutions-architect',
  },
  {
    name: 'Developer',
    avatar: '💻',
    description: 'Takes requirements and implements features.',
    skill: 'coding-implementation',
  },
  {
    name: 'QA Tester',
    avatar: '🧪',
    description: 'Validates quality and expected behavior through testing.',
    skill: 'qa-testing',
  },
  {
    name: 'DevOps Engineer',
    avatar: '⚙️',
    description: 'Builds and operates deployment and runtime workflows.',
    skill: 'devops-engineering',
  },
];
