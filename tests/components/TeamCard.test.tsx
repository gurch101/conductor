import { describe, it, expect, mock, afterEach } from 'bun:test';
import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { TeamCard } from '@/components/TeamCard';
import type { Team } from '@/types';
import { AgentStatus } from '@/constants/agentStatus';

describe('TeamCard Component', () => {
  afterEach(() => {
    cleanup();
  });

  const mockTeam: Team = {
    id: '1',
    name: 'Test Team',
    agents: [],
    connections: [],
  };

  it('renders team name', () => {
    render(
      <TeamCard
        team={mockTeam}
        onClick={() => {}}
        onPlay={() => {}}
        onEdit={() => {}}
        onDelete={() => {}}
      />
    );
    expect(screen.getByText('Test Team')).toBeDefined();
  });

  it('calls onClick when the card is clicked', () => {
    const handleClick = mock(() => {});
    render(
      <TeamCard
        team={mockTeam}
        onClick={handleClick}
        onPlay={() => {}}
        onEdit={() => {}}
        onDelete={() => {}}
      />
    );
    fireEvent.click(screen.getByText('Test Team'));
    expect(handleClick).toHaveBeenCalled();
  });

  it('calls onDelete when the delete option is clicked in the menu', () => {
    const handleDelete = mock(() => {});
    render(
      <TeamCard
        team={mockTeam}
        onClick={() => {}}
        onPlay={() => {}}
        onEdit={() => {}}
        onDelete={handleDelete}
      />
    );

    // 1. Click menu button (MoreVertical icon button)
    const menuButton = screen.getByLabelText('Open menu');
    fireEvent.click(menuButton);

    // 2. Click Delete Team button
    const deleteButton = screen.getByText('Delete Team');
    fireEvent.click(deleteButton);

    expect(handleDelete).toHaveBeenCalledWith('1');
  });

  it("shows 'Done' status when all agents are done", () => {
    const teamWithDoneAgents: Team = {
      ...mockTeam,
      agents: [
        {
          id: 'a1',
          team_id: '1',
          description: 'A1',
          status: AgentStatus.Done,
          summary: 'done',
          tokensUsed: 0,
          input_schema: [],
          output_schema: [],
          logs: [],
        },
      ],
    };
    render(
      <TeamCard
        team={teamWithDoneAgents}
        onClick={() => {}}
        onPlay={() => {}}
        onEdit={() => {}}
        onDelete={() => {}}
      />
    );
    expect(screen.getByText('Done')).toBeDefined();
  });

  it("shows 'Action Needed' when an agent is waiting for feedback", () => {
    const teamWithActionNeeded: Team = {
      ...mockTeam,
      agents: [
        {
          id: 'a1',
          team_id: '1',
          description: 'A1',
          status: AgentStatus.Done,
          summary: 'done',
          tokensUsed: 0,
          input_schema: [],
          output_schema: [],
          logs: [],
        },
        {
          id: 'a2',
          team_id: '1',
          description: 'A2',
          status: AgentStatus.WaitingForFeedback,
          summary: 'wait',
          tokensUsed: 0,
          input_schema: [],
          output_schema: [],
          logs: [],
        },
      ],
    };
    render(
      <TeamCard
        team={teamWithActionNeeded}
        onClick={() => {}}
        onPlay={() => {}}
        onEdit={() => {}}
        onDelete={() => {}}
      />
    );
    expect(screen.getByText('Action Needed')).toBeDefined();
  });

  it('calls onPlay when start button is clicked', () => {
    const handlePlay = mock(() => {});
    render(
      <TeamCard
        team={mockTeam}
        onClick={() => {}}
        onPlay={handlePlay}
        onEdit={() => {}}
        onDelete={() => {}}
      />
    );
    fireEvent.click(screen.getByLabelText('Start Test Team'));
    expect(handlePlay).toHaveBeenCalledWith(mockTeam);
  });

  it('calls onEdit when edit option is clicked in the menu', () => {
    const handleEdit = mock(() => {});
    render(
      <TeamCard
        team={mockTeam}
        onClick={() => {}}
        onPlay={() => {}}
        onEdit={handleEdit}
        onDelete={() => {}}
      />
    );

    fireEvent.click(screen.getByLabelText('Open menu'));
    fireEvent.click(screen.getByText('Edit Team'));

    expect(handleEdit).toHaveBeenCalledWith(mockTeam);
  });
});
