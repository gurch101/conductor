import { describe, it, expect, beforeAll } from 'bun:test';
import { appOptions } from '@/index';
import { initDb } from '@/db';
import type { Team, Persona } from '@/types';
import { AgentStatus } from '@/constants/agentStatus';

type RouteHandler = (
  req?: Request & { params?: Record<string, string> }
) => Response | Promise<Response>;

describe('Server API', () => {
  const routes = appOptions.routes as Record<string, Record<string, RouteHandler>>;

  const callGet = async (path: string) => {
    return routes[path].GET();
  };

  const callGetWithParams = async (path: string, params: Record<string, string>) => {
    return routes[path].GET(
      Object.assign(new Request(`http://localhost${path}`, { method: 'GET' }), { params })
    );
  };

  const callPost = async (path: string, body: unknown) => {
    return routes[path].POST(
      new Request(`http://localhost${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
    );
  };

  const callPostWithParams = async (
    path: string,
    params: Record<string, string>,
    body?: unknown
  ) => {
    return routes[path].POST(
      Object.assign(
        new Request(`http://localhost${path}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: body !== undefined ? JSON.stringify(body) : undefined,
        }),
        { params }
      )
    );
  };

  const callPut = async (path: string, params: Record<string, string>, body: unknown) => {
    return routes[path].PUT(
      Object.assign(
        new Request(`http://localhost${path}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        }),
        { params }
      )
    );
  };

  const callDelete = async (path: string, params: Record<string, string>) => {
    return routes[path].DELETE(
      Object.assign(new Request(`http://localhost${path}`, { method: 'DELETE' }), { params })
    );
  };

  const callDeleteWithBody = async (path: string, body: unknown) => {
    return routes[path].DELETE(
      new Request(`http://localhost${path}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
    );
  };

  beforeAll(() => {
    initDb();
  });

  it('GET /api/personas - should return default personas', async () => {
    const res = await callGet('/api/personas');
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

    const res = await callPost('/api/teams', newTeam);
    expect(res.status).toBe(200);
    const team = (await res.json()) as Team;
    expect(team.name).toBe(newTeam.name);
    expect(team.objective).toBe(newTeam.objective);
    expect(team.id).toBeDefined();
  });

  it('GET /api/teams - should return all teams', async () => {
    const res = await callGet('/api/teams');
    expect(res.status).toBe(200);
    const teams = (await res.json()) as Team[];
    expect(Array.isArray(teams)).toBe(true);
    expect(teams.some((t) => t.name === 'API Test Team')).toBe(true);
  });

  it('POST /api/agents - should add an agent to a team', async () => {
    const teamsRes = await callGet('/api/teams');
    const teams = (await teamsRes.json()) as Team[];
    const team = teams.find((t) => t.name === 'API Test Team')!;

    const personasRes = await callGet('/api/personas');
    const personas = (await personasRes.json()) as Persona[];
    const persona = personas[0]!;

    const newAgent = {
      id: 'test-agent-1',
      team_id: team.id,
      persona_id: persona.id,
      status: AgentStatus.Working,
      summary: 'Testing agent creation',
      tokensUsed: 0,
      input_schema: [],
      output_schema: [],
      pos_x: 100,
      pos_y: 100,
    };

    const res = await callPost('/api/agents', newAgent);
    expect(res.status).toBe(200);
    expect((await res.json()).success).toBe(true);

    const teamRes = await routes['/api/teams/:id'].GET({ params: { id: team.id } } as Request & {
      params: Record<string, string>;
    });
    const hydratedTeam = (await teamRes.json()) as Team;
    expect(hydratedTeam.agents.length).toBe(3);
    const createdAgent = hydratedTeam.agents.find((a) => a.id === 'test-agent-1');
    expect(createdAgent?.description).toBe(persona.description || persona.name);
  });

  it('POST /api/connections - should connect two agents', async () => {
    const teamsRes = await callGet('/api/teams');
    const teams = (await teamsRes.json()) as Team[];
    const team = teams.find((t) => t.name === 'API Test Team')!;

    const personasRes = await callGet('/api/personas');
    const personas = (await personasRes.json()) as Persona[];
    const persona = (personas[1] || personas[0])!;

    const agent2 = {
      id: 'test-agent-2',
      team_id: team.id,
      persona_id: persona.id,
      status: AgentStatus.Working,
      summary: 'Second agent',
      tokensUsed: 0,
      input_schema: [],
      output_schema: [],
      pos_x: 300,
      pos_y: 100,
    };
    await callPost('/api/agents', agent2);

    const connection = {
      team_id: team.id,
      source_id: 'test-agent-1',
      source_handle: 'out',
      target_id: 'test-agent-2',
      target_handle: 'in',
    };

    const res = await callPost('/api/connections', connection);
    expect(res.status).toBe(200);
    expect((await res.json()).success).toBe(true);

    const teamRes = await routes['/api/teams/:id'].GET({ params: { id: team.id } } as Request & {
      params: Record<string, string>;
    });
    const hydratedTeam = (await teamRes.json()) as Team;
    expect(hydratedTeam.connections.length).toBe(2);
    const createdConnection = hydratedTeam.connections.find(
      (c) => c.source === 'test-agent-1' && c.target === 'test-agent-2'
    );
    expect(createdConnection).toBeDefined();
  });

  it('DELETE /api/connections - should remove a connection', async () => {
    const teamsRes = await callGet('/api/teams');
    const teams = (await teamsRes.json()) as Team[];
    const team = teams.find((t) => t.name === 'API Test Team')!;

    const res = await callDeleteWithBody('/api/connections', {
      team_id: team.id,
      source_id: 'test-agent-1',
      source_handle: 'out',
      target_id: 'test-agent-2',
      target_handle: 'in',
    });
    expect(res.status).toBe(200);
    expect((await res.json()).success).toBe(true);

    const teamRes = await routes['/api/teams/:id'].GET({ params: { id: team.id } } as Request & {
      params: Record<string, string>;
    });
    const hydratedTeam = (await teamRes.json()) as Team;
    expect(hydratedTeam.connections.length).toBe(1);
  });

  it('PUT /api/teams/:id - should update team details', async () => {
    const teamsRes = await callGet('/api/teams');
    const teams = (await teamsRes.json()) as Team[];
    const team = teams.find((t) => t.name === 'API Test Team')!;

    const updatedDetails = {
      name: 'Updated Test Team',
      objective: 'Verify update functionality works',
    };
    const updateRes = await callPut('/api/teams/:id', { id: team.id }, updatedDetails);
    expect(updateRes.status).toBe(200);
    expect((await updateRes.json()).success).toBe(true);

    const getRes = await routes['/api/teams/:id'].GET({ params: { id: team.id } } as Request & {
      params: Record<string, string>;
    });
    const updatedTeam = (await getRes.json()) as Team;
    expect(updatedTeam.name).toBe(updatedDetails.name);
    expect(updatedTeam.objective).toBe(updatedDetails.objective);
  });

  it('DELETE /api/teams/:id - should delete the team', async () => {
    const teamsRes = await callGet('/api/teams');
    const teams = (await teamsRes.json()) as Team[];
    const team = teams.find((t) => t.name === 'Updated Test Team')!;

    const deleteRes = await callDelete('/api/teams/:id', { id: team.id });
    expect(deleteRes.status).toBe(200);
    expect((await deleteRes.json()).success).toBe(true);

    const getRes = await routes['/api/teams/:id'].GET({ params: { id: team.id } } as Request & {
      params: Record<string, string>;
    });
    expect(getRes.status).toBe(404);

    const allTeamsRes = await callGet('/api/teams');
    const allTeams = (await allTeamsRes.json()) as Team[];
    expect(allTeams.some((t) => t.id === team.id)).toBe(false);
  });

  it('DELETE /api/agents/:id - should delete an agent', async () => {
    const teamRes = await callPost('/api/teams', {
      name: 'Delete Agent Team',
      objective: 'Test deletion',
    });
    const team = (await teamRes.json()) as Team;

    const agentId = 'agent-to-delete';
    await callPost('/api/agents', {
      id: agentId,
      team_id: team.id,
      status: AgentStatus.Working,
      summary: '...',
      tokensUsed: 0,
      input_schema: [],
      output_schema: [],
    });

    const deleteRes = await callDelete('/api/agents/:id', { id: agentId });
    expect(deleteRes.status).toBe(200);
    expect((await deleteRes.json()).success).toBe(true);

    const hydratedTeamRes = await routes['/api/teams/:id'].GET({
      params: { id: team.id },
    } as Request & {
      params: Record<string, string>;
    });
    const hydratedTeam = (await hydratedTeamRes.json()) as Team;
    expect(hydratedTeam.agents.some((a) => a.id === agentId)).toBe(false);
  });

  it('PUT /api/agents/:id - should update agent position', async () => {
    const teamRes = await callPost('/api/teams', {
      name: 'Move Agent Team',
      objective: 'Test movement',
    });
    const team = (await teamRes.json()) as Team;

    const agentId = 'agent-to-move';
    await callPost('/api/agents', {
      id: agentId,
      team_id: team.id,
      status: AgentStatus.Working,
      summary: '...',
      tokensUsed: 0,
      input_schema: [],
      output_schema: [],
      pos_x: 10,
      pos_y: 20,
    });

    const res = await callPut('/api/agents/:id', { id: agentId }, { pos_x: 456, pos_y: 789 });
    expect(res.status).toBe(200);
    expect((await res.json()).success).toBe(true);

    const hydratedTeamRes = await routes['/api/teams/:id'].GET({
      params: { id: team.id },
    } as Request & {
      params: Record<string, string>;
    });
    const hydratedTeam = (await hydratedTeamRes.json()) as Team;
    const movedAgent = hydratedTeam.agents.find((a) => a.id === agentId);
    expect(movedAgent?.pos_x).toBe(456);
    expect(movedAgent?.pos_y).toBe(789);
  });

  it('DELETE /api/personas/:id - should delete a persona', async () => {
    const personasRes = await callGet('/api/personas');
    const personas = (await personasRes.json()) as Persona[];
    const personaId = personas[0]!.id;

    const deleteRes = await callDelete('/api/personas/:id', { id: personaId });
    expect(deleteRes.status).toBe(200);
    expect((await deleteRes.json()).success).toBe(true);

    const updatedPersonasRes = await callGet('/api/personas');
    const updatedPersonas = (await updatedPersonasRes.json()) as Persona[];
    expect(updatedPersonas.some((p) => p.id === personaId)).toBe(false);
  });

  it('DELETE /api/personas/:id - should fail if persona is in use', async () => {
    const personasRes = await callGet('/api/personas');
    const personas = (await personasRes.json()) as Persona[];
    const persona = personas[0]!;

    const teamRes = await callPost('/api/teams', {
      name: 'Usage Test Team',
      objective: 'Test usage',
    });
    const team = (await teamRes.json()) as Team;

    await callPost('/api/agents', {
      id: 'agent-using-persona',
      team_id: team.id,
      persona_id: persona.id,
      status: AgentStatus.Working,
      summary: '...',
      tokensUsed: 0,
      input_schema: [],
      output_schema: [],
    });

    const deleteRes = await callDelete('/api/personas/:id', { id: persona.id });
    expect(deleteRes.status).toBe(400);
    const errorData = await deleteRes.json();
    expect(errorData.error).toContain('Cannot delete a persona that is currently in use');

    const checkRes = await callGet('/api/personas');
    const currentPersonas = (await checkRes.json()) as Persona[];
    expect(currentPersonas.some((p) => p.id === persona.id)).toBe(true);
  });

  it('POST /api/teams/:id/start and /api/teams/:id/respond - should run and accept human responses', async () => {
    const teamRes = await callPost('/api/teams', {
      name: 'Run Team',
      objective: 'Ship a release safely',
    });
    const team = (await teamRes.json()) as Team;

    const personasRes = await callGet('/api/personas');
    const personas = (await personasRes.json()) as Persona[];
    const persona = personas[0]!;

    await callPost('/api/agents', {
      id: 'run-agent-1',
      team_id: team.id,
      persona_id: persona.id,
      status: AgentStatus.Working,
      summary: 'Prepare release plan',
      tokensUsed: 0,
      input_schema: [],
      output_schema: [],
    });

    await callPost('/api/agents', {
      id: 'run-agent-2',
      team_id: team.id,
      persona_id: persona.id,
      status: AgentStatus.Working,
      summary: 'Validate deployment access',
      tokensUsed: 0,
      input_schema: [],
      output_schema: [],
    });

    const startRes = await callPostWithParams('/api/teams/:id/start', { id: team.id });
    expect(startRes.status).toBe(200);
    const startedTeam = (await startRes.json()) as Team;
    expect(startedTeam.agents.some((a) => a.status === AgentStatus.WaitingForFeedback)).toBe(true);

    const waitingAgent = startedTeam.agents.find(
      (a) => a.status === AgentStatus.WaitingForFeedback
    )!;
    const respondRes = await callPostWithParams(
      '/api/teams/:id/respond',
      { id: team.id },
      { agentId: waitingAgent.id, message: 'Approved. Continue execution.' }
    );
    expect(respondRes.status).toBe(200);
    const respondedTeam = (await respondRes.json()) as Team;

    const updatedAgent = respondedTeam.agents.find((a) => a.id === waitingAgent.id)!;
    expect(updatedAgent.status).toBe(AgentStatus.Working);
    expect(updatedAgent.logs.some((log) => log.includes('Human response'))).toBe(true);
  });

  it('GET /api/teams/:id/stream - should return initial NDJSON events', async () => {
    const teamRes = await callPost('/api/teams', {
      name: 'Stream Team',
      objective: 'Validate streaming',
    });
    const team = (await teamRes.json()) as Team;

    const streamRes = await callGetWithParams('/api/teams/:id/stream', { id: team.id });
    expect(streamRes.status).toBe(200);
    expect(streamRes.headers.get('Content-Type')).toContain('application/x-ndjson');
    expect(streamRes.body).toBeDefined();

    const reader = streamRes.body!.getReader();
    const { value } = await reader.read();
    const chunk = new TextDecoder().decode(value || new Uint8Array());
    const firstLine = chunk.split('\n').find((line) => line.trim().length > 0) || '';
    const event = JSON.parse(firstLine) as { type: string };
    expect(event.type).toBe('stream_open');
  });

  it('DELETE /api/teams/:id - should fail if the team has an active stream', async () => {
    const teamRes = await callPost('/api/teams', {
      name: 'Active Stream Team',
      objective: 'Cannot be deleted while active',
    });
    const team = (await teamRes.json()) as Team;

    const streamRes = await callGetWithParams('/api/teams/:id/stream', { id: team.id });
    expect(streamRes.status).toBe(200);
    expect(streamRes.body).toBeDefined();

    const reader = streamRes.body!.getReader();
    await reader.read();

    const deleteRes = await callDelete('/api/teams/:id', { id: team.id });
    expect(deleteRes.status).toBe(400);
    const errorData = (await deleteRes.json()) as { error: string };
    expect(errorData.error).toContain('currently active');

    await reader.cancel();
  });
});
