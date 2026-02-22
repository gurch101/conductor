import { describe, it, expect, beforeAll } from 'bun:test';
import { initDb } from '@/db';
import { TeamService } from '@/services/TeamService';
import { ConnectionRepository } from '@/repositories/ConnectionRepository';
import { AgentRepository } from '@/repositories/AgentRepository';
import type { Agent } from '@/types';
import { AgentStatus } from '@/constants/agentStatus';

describe('ConnectionRepository', () => {
  beforeAll(() => {
    initDb();
  });

  it('replaceForTeam should replace all connections for a team', () => {
    const team = TeamService.createTeam('Connections Replace');
    const start = team.agents.find((a) => a.persona_name === 'Start')!;
    const end = team.agents.find((a) => a.persona_name === 'End')!;

    const extra: Agent = {
      id: `agent-extra-${crypto.randomUUID()}`,
      team_id: team.id,
      persona_id: 'persona-developer',
      persona_name: 'Developer',
      description: 'Takes requirements and implements features.',
      status: AgentStatus.Working,
      summary: 'Extra node.',
      tokensUsed: 0,
      input_schema: [],
      output_schema: [],
      logs: [],
      pos_x: 320,
      pos_y: 200,
    };
    AgentRepository.create(extra);

    ConnectionRepository.replaceForTeam(team.id, [
      { source: start.id, target: extra.id },
      { source: extra.id, target: end.id },
    ]);

    const connections = ConnectionRepository.findByTeamId(team.id);
    expect(connections.length).toBe(2);
    const pair = connections.map((c) => [c.sourceId, c.targetId]);
    expect(pair).toContainEqual([start.id, extra.id]);
    expect(pair).toContainEqual([extra.id, end.id]);
  });
});
