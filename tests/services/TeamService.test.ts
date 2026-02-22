import { describe, it, expect, beforeAll } from 'bun:test';
import { TeamService } from '@/services/TeamService';
import { initDb } from '@/db';
import type { Agent } from '@/types';
import { AgentStatus } from '@/constants/agentStatus';

describe('TeamService', () => {
  beforeAll(() => {
    initDb();
  });

  it('updateTeam should modify an existing team', () => {
    // 1. Create a team
    const initialName = 'Initial Team Name';
    const initialObjective = 'Initial Objective';
    const team = TeamService.createTeam(initialName, initialObjective);
    expect(team.name).toBe(initialName);
    expect(team.objective).toBe(initialObjective);

    // 2. Update it
    const newName = 'Updated Team Name';
    const newObjective = 'Updated Objective';
    TeamService.updateTeam(team.id, newName, newObjective);

    // 3. Retrieve and verify
    const updatedTeam = TeamService.getTeamById(team.id);
    expect(updatedTeam).toBeDefined();
    expect(updatedTeam?.name).toBe(newName);
    expect(updatedTeam?.objective).toBe(newObjective);
  });

  it('createTeam should fail if name is empty', () => {
    expect(() => TeamService.createTeam('', 'Objective')).toThrow('Team name is required.');
    expect(() => TeamService.createTeam('   ', 'Objective')).toThrow('Team name is required.');
  });

  it('createTeam should fail if name is not unique', () => {
    const name = 'Duplicate Name';
    TeamService.createTeam(name, 'First');
    expect(() => TeamService.createTeam(name, 'Second')).toThrow(
      `Team name "${name}" is already taken.`
    );
  });

  it('updateTeam should fail if name is empty', () => {
    const team = TeamService.createTeam('Valid Name', 'Objective');
    expect(() => TeamService.updateTeam(team.id, '', 'New Obj')).toThrow('Team name is required.');
  });

  it('updateTeam should fail if name is taken by another team', () => {
    TeamService.createTeam('Team 1', 'Obj 1');
    const team2 = TeamService.createTeam('Team 2', 'Obj 2');
    expect(() => TeamService.updateTeam(team2.id, 'Team 1', 'Updated Obj')).toThrow(
      'Team name "Team 1" is already taken.'
    );
  });

  it('updateTeam should succeed if name is same for the same team', () => {
    const team = TeamService.createTeam('Same Name', 'Obj');
    // This should NOT throw
    TeamService.updateTeam(team.id, 'Same Name', 'New Obj');
    const updated = TeamService.getTeamById(team.id);
    expect(updated?.objective).toBe('New Obj');
  });

  it('deleteTeam should remove the team from the database', () => {
    const team = TeamService.createTeam('To Be Deleted', 'Objective');
    const id = team.id;
    expect(TeamService.getTeamById(id)).toBeDefined();

    TeamService.deleteTeam(id);
    expect(TeamService.getTeamById(id)).toBeNull();
  });

  it('createTeam should generate a team with Start and End nodes and a path', () => {
    const team = TeamService.createTeam('Service Test Team', 'Objective');
    expect(team.id).toBeDefined();
    const start = team.agents.find((a) => a.persona_name === 'Start');
    const end = team.agents.find((a) => a.persona_name === 'End');
    expect(start).toBeDefined();
    expect(end).toBeDefined();
    expect(team.connections.some((c) => c.source === start?.id && c.target === end?.id)).toBe(true);
  });

  it('updateTeam should reject teams without a Start node', () => {
    const team = TeamService.createTeam('Missing Start', 'Objective');
    const agents = team.agents.filter((a) => a.persona_name !== 'Start');
    expect(() =>
      TeamService.updateTeam(team.id, team.name, team.objective, agents, team.connections)
    ).toThrow('Team must include exactly one Start node.');
  });

  it('updateTeam should reject teams without an End node', () => {
    const team = TeamService.createTeam('Missing End', 'Objective');
    const agents = team.agents.filter((a) => a.persona_name !== 'End');
    expect(() =>
      TeamService.updateTeam(team.id, team.name, team.objective, agents, team.connections)
    ).toThrow('Team must include exactly one End node.');
  });

  it('updateTeam should reject teams without a Start-to-End path', () => {
    const team = TeamService.createTeam('No Path', 'Objective');
    expect(() =>
      TeamService.updateTeam(team.id, team.name, team.objective, team.agents, [])
    ).toThrow('A valid path from Start to End is required.');
  });

  it('getNextAgents should return the next ready agent in a simple path', () => {
    const team = TeamService.createTeam('Next Agents Simple', 'Objective');
    const start = team.agents.find((a) => a.persona_name === 'Start')!;
    const end = team.agents.find((a) => a.persona_name === 'End')!;

    const dev: Agent = {
      id: `agent-dev-${crypto.randomUUID()}`,
      team_id: team.id,
      persona_id: 'persona-developer',
      persona_name: 'Developer',
      description: 'Takes requirements and implements features.',
      status: AgentStatus.Working,
      summary: 'Implement features.',
      tokensUsed: 0,
      input_schema: [],
      output_schema: [],
      logs: [],
      pos_x: 300,
      pos_y: 200,
    };

    const agents = [start, dev, end];
    const connections = [
      { source: start.id, target: dev.id },
      { source: dev.id, target: end.id },
    ];

    TeamService.updateTeam(team.id, team.name, team.objective, agents, connections);
    const next = TeamService.getNextAgents(team.id);
    expect(next.map((a) => a.id)).toEqual([dev.id]);
  });

  it('getNextAgents should return multiple ready agents when branching', () => {
    const team = TeamService.createTeam('Next Agents Branch', 'Objective');
    const start = team.agents.find((a) => a.persona_name === 'Start')!;
    const end = team.agents.find((a) => a.persona_name === 'End')!;

    const a1: Agent = {
      id: `agent-a1-${crypto.randomUUID()}`,
      team_id: team.id,
      persona_id: 'persona-qa-tester',
      persona_name: 'QA Tester',
      description: 'Validates quality and expected behavior through testing.',
      status: AgentStatus.Working,
      summary: 'Test changes.',
      tokensUsed: 0,
      input_schema: [],
      output_schema: [],
      logs: [],
      pos_x: 300,
      pos_y: 140,
    };
    const a2: Agent = {
      id: `agent-a2-${crypto.randomUUID()}`,
      team_id: team.id,
      persona_id: 'persona-business-analyst',
      persona_name: 'Business Analyst (BA)',
      description: 'Translates high-level requirements in the PRD to detailed requirements.',
      status: AgentStatus.Working,
      summary: 'Refine requirements.',
      tokensUsed: 0,
      input_schema: [],
      output_schema: [],
      logs: [],
      pos_x: 300,
      pos_y: 260,
    };

    const agents = [start, a1, a2, end];
    const connections = [
      { source: start.id, target: a1.id },
      { source: start.id, target: a2.id },
      { source: a1.id, target: end.id },
      { source: a2.id, target: end.id },
    ];

    TeamService.updateTeam(team.id, team.name, team.objective, agents, connections);
    const next = TeamService.getNextAgents(team.id);
    const ids = next.map((a) => a.id).sort();
    expect(ids).toEqual([a1.id, a2.id].sort());
  });
});
