import { describe, it, expect, beforeAll, afterAll } from 'bun:test';
import { serve, type Server } from 'bun';
import { appOptions } from '@/index';
import { initDb } from '@/db';
import type { Team, Persona } from '@/types';

describe('Server API', () => {
  let testServer: Server;
  let baseUrl: string;

  beforeAll(() => {
    initDb();
    testServer = serve({ ...appOptions, port: 0 });
    baseUrl = `http://localhost:${testServer.port}`;
  });

  afterAll(() => {
    testServer.stop();
  });

  it('GET /api/personas - should return default personas', async () => {
    const res = await fetch(`${baseUrl}/api/personas`);
    expect(res.status).toBe(200);
    const personas = (await res.json()) as Persona[];
    expect(Array.isArray(personas)).toBe(true);
    expect(personas.length).toBeGreaterThan(0);
    expect(personas[0]?.name).toBeDefined();
    expect(personas[0]?.avatar).toBeDefined();
  });

  it('POST /api/teams - should create a new team', async () => {
    const newTeam = {
      name: 'API Test Team',
      objective: 'Verify API functionality',
    };
    const res = await fetch(`${baseUrl}/api/teams`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newTeam),
    });
    expect(res.status).toBe(200);
    const team = (await res.json()) as Team;
    expect(team.name).toBe(newTeam.name);
    expect(team.objective).toBe(newTeam.objective);
    expect(team.id).toBeDefined();
  });

  it('GET /api/teams - should return all teams', async () => {
    const res = await fetch(`${baseUrl}/api/teams`);
    expect(res.status).toBe(200);
    const teams = (await res.json()) as Team[];
    expect(Array.isArray(teams)).toBe(true);
    expect(teams.some((t) => t.name === 'API Test Team')).toBe(true);
  });

  it('POST /api/agents - should add an agent to a team', async () => {
    // 1. Get the team we just created
    const teamsRes = await fetch(`${baseUrl}/api/teams`);
    const teams = (await teamsRes.json()) as Team[];
    const team = teams.find((t) => t.name === 'API Test Team')!;

    // 2. Add an agent
    const newAgent = {
      id: 'test-agent-1',
      team_id: team.id,
      role: 'Tester',
      status: 'working',
      summary: 'Testing agent creation',
      tokens_used: 0,
      input_schema: JSON.stringify([]),
      output_schema: JSON.stringify([]),
      pos_x: 100,
      pos_y: 100,
    };

    const res = await fetch(`${baseUrl}/api/agents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newAgent),
    });
    expect(res.status).toBe(200);
    expect((await res.json()).success).toBe(true);

    // 3. Verify it's in the team
    const teamRes = await fetch(`${baseUrl}/api/teams/${team.id}`);
    const hydratedTeam = (await teamRes.json()) as Team;
    expect(hydratedTeam.agents.length).toBe(1);
    expect(hydratedTeam.agents[0]?.role).toBe('Tester');
  });

  it('POST /api/connections - should connect two agents', async () => {
    // 1. Get the team
    const teamsRes = await fetch(`${baseUrl}/api/teams`);
    const teams = (await teamsRes.json()) as Team[];
    const team = teams.find((t) => t.name === 'API Test Team')!;

    // 2. Add another agent
    const agent2 = {
      id: 'test-agent-2',
      team_id: team.id,
      role: 'Reviewer',
      status: 'working',
      summary: 'Second agent',
      tokens_used: 0,
      input_schema: '[]',
      output_schema: '[]',
      pos_x: 300,
      pos_y: 100,
    };
    await fetch(`${baseUrl}/api/agents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(agent2),
    });

    // 3. Create connection
    const connection = {
      team_id: team.id,
      source_id: 'test-agent-1',
      source_handle: 'out',
      target_id: 'test-agent-2',
      target_handle: 'in',
    };

    const res = await fetch(`${baseUrl}/api/connections`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(connection),
    });
    expect(res.status).toBe(200);
    expect((await res.json()).success).toBe(true);

    // 4. Verify connection
    const teamRes = await fetch(`${baseUrl}/api/teams/${team.id}`);
    const hydratedTeam = (await teamRes.json()) as Team;
    expect(hydratedTeam.connections.length).toBe(1);
    expect(hydratedTeam.connections[0]?.source).toBe('test-agent-1');
    expect(hydratedTeam.connections[0]?.target).toBe('test-agent-2');
  });

  it('PUT /api/teams/:id - should update team details', async () => {
    // 1. Get the team
    const teamsRes = await fetch(`${baseUrl}/api/teams`);
    const teams = (await teamsRes.json()) as Team[];
    const team = teams.find((t) => t.name === 'API Test Team')!;

    // 2. Update the team
    const updatedDetails = {
      name: 'Updated Test Team',
      objective: 'Verify update functionality works',
    };
    const updateRes = await fetch(`${baseUrl}/api/teams/${team.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedDetails),
    });
    expect(updateRes.status).toBe(200);
    expect((await updateRes.json()).success).toBe(true);

    // 3. Verify it's updated
    const getRes = await fetch(`${baseUrl}/api/teams/${team.id}`);
    const updatedTeam = (await getRes.json()) as Team;
    expect(updatedTeam.name).toBe(updatedDetails.name);
    expect(updatedTeam.objective).toBe(updatedDetails.objective);
  });

  it('DELETE /api/teams/:id - should delete the team', async () => {
    // 1. Get the team
    const teamsRes = await fetch(`${baseUrl}/api/teams`);
    const teams = (await teamsRes.json()) as Team[];
    const team = teams.find((t) => t.name === 'Updated Test Team')!;

    // 2. Delete it
    const deleteRes = await fetch(`${baseUrl}/api/teams/${team.id}`, {
      method: 'DELETE',
    });
    expect(deleteRes.status).toBe(200);
    expect((await deleteRes.json()).success).toBe(true);

    // 3. Verify it is gone
    const getRes = await fetch(`${baseUrl}/api/teams/${team.id}`);
    expect(getRes.status).toBe(404);

    const allTeamsRes = await fetch(`${baseUrl}/api/teams`);
    const allTeams = (await allTeamsRes.json()) as Team[];
    expect(allTeams.some((t) => t.id === team.id)).toBe(false);
  });
});
