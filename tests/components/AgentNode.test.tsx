import { describe, it, expect, mock } from 'bun:test';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { AgentNode } from '@/components/AgentNode';
import type { Agent } from '@/types';

// Mock React Flow
mock.module('reactflow', () => ({
  Handle: () => <div data-testid="handle" />,
  Position: { Top: 'top', Bottom: 'bottom', Left: 'left', Right: 'right' },
  useReactFlow: () => ({ deleteElements: () => {} }),
}));

describe('AgentNode Component', () => {
  const mockAgent: Agent = {
    id: 'a1',
    team_id: 't1',
    persona_name: 'Researcher',
    description: 'Researcher',
    status: 'working',
    summary: 'Researching tech',
    tokensUsed: 1500,
    input_schema: [],
    output_schema: [],
    logs: ['Log 1'],
  };

  it('renders description and summary', () => {
    render(<AgentNode data={mockAgent} />);
    // Use regex to be case-insensitive
    expect(screen.getByText(/Researcher/i)).toBeDefined();
    expect(screen.getByText(/Researching tech/i)).toBeDefined();
  });

  it('calculates cost correctly ($0.02 per 1k tokens)', () => {
    render(<AgentNode data={mockAgent} />);
    // The text might be split, so let's check for the value
    expect(screen.getByText(/0\.030/)).toBeDefined();
  });

  it('hides delete button for Start node', () => {
    render(
      <AgentNode
        data={{
          ...mockAgent,
          persona_name: 'Start',
          persona_id: 'persona-start',
        }}
      />
    );
    expect(screen.queryByTitle('Delete Agent')).toBeNull();
  });

  it('hides delete button for End node', () => {
    render(
      <AgentNode
        data={{
          ...mockAgent,
          persona_name: 'End',
          persona_id: 'persona-end',
        }}
      />
    );
    expect(screen.queryByTitle('Delete Agent')).toBeNull();
  });

  it('shows delete button for non-protected nodes', () => {
    render(<AgentNode data={mockAgent} />);
    expect(screen.getByTitle('Delete Agent')).toBeDefined();
  });
});
