import { describe, it, expect, mock } from 'bun:test';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { AgentNode } from '@/components/AgentNode';
import type { Agent } from '@/types';

// Mock React Flow
mock.module('reactflow', () => ({
  Handle: () => <div data-testid="handle" />,
  Position: { Top: 'top', Bottom: 'bottom' },
}));

describe('AgentNode Component', () => {
  const mockAgent: Agent = {
    id: 'a1',
    team_id: 't1',
    role: 'Researcher',
    status: 'working',
    summary: 'Researching tech',
    tokensUsed: 1500,
    input_schema: [],
    output_schema: [],
    logs: ['Log 1'],
  };

  it('renders role and summary', () => {
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
});
