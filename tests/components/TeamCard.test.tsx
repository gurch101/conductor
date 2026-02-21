import { describe, it, expect } from 'bun:test';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { TeamCard } from '@/components/TeamCard';
import type { Team } from '@/types';

describe('TeamCard Component', () => {
  const mockTeam: Team = {
    id: '1',
    name: 'Test Team',
    objective: 'Test Objective',
    agents: [],
    connections: [],
  };

  it('renders team name and objective', () => {
    render(<TeamCard team={mockTeam} onClick={() => {}} />);
    expect(screen.getByText('Test Team')).toBeDefined();
    expect(screen.getByText('Test Objective')).toBeDefined();
  });

  it("shows 'Done' status when all agents are done", () => {
    const teamWithDoneAgents: Team = {
      ...mockTeam,
      agents: [
        {
          id: 'a1',
          team_id: '1',
          role: 'A1',
          status: 'done',
          summary: 'done',
          tokensUsed: 0,
          input_schema: [],
          output_schema: [],
          logs: [],
        },
      ],
    };
    render(<TeamCard team={teamWithDoneAgents} onClick={() => {}} />);
    expect(screen.getByText('Done')).toBeDefined();
  });

  it("shows 'Action Needed' when an agent is waiting approval", () => {
    const teamWithActionNeeded: Team = {
      ...mockTeam,
      agents: [
        {
          id: 'a1',
          team_id: '1',
          role: 'A1',
          status: 'done',
          summary: 'done',
          tokensUsed: 0,
          input_schema: [],
          output_schema: [],
          logs: [],
        },
        {
          id: 'a2',
          team_id: '1',
          role: 'A2',
          status: 'waiting_approval',
          summary: 'wait',
          tokensUsed: 0,
          input_schema: [],
          output_schema: [],
          logs: [],
        },
      ],
    };
    render(<TeamCard team={teamWithActionNeeded} onClick={() => {}} />);
    expect(screen.getByText('Action Needed')).toBeDefined();
  });
});
