import { TeamRepository } from '@/repositories/TeamRepository';
import { AgentRepository } from '@/repositories/AgentRepository';
import { ConnectionRepository } from '@/repositories/ConnectionRepository';
import { PersonaRepository } from '@/repositories/PersonaRepository';
import type { Team, Agent, DBTeam } from '@/types';

/**
 * Service for managing teams and their associated agents and connections.
 */
export class TeamService {
  /**
   * Retrieves all teams with their agents and connections fully hydrated.
   * @returns A list of hydrated teams.
   */
  static getAllTeams(): Team[] {
    const teams = TeamRepository.findAll();
    return teams.map((team) => this.hydrateTeam(team));
  }

  /**
   * Finds a team by ID and returns it fully hydrated.
   * @param id The ID of the team.
   * @returns The hydrated team or null if not found.
   */
  static getTeamById(id: string): Team | null {
    const team = TeamRepository.findById(id);
    if (!team) return null;
    return this.hydrateTeam(team);
  }

  /**
   * Checks if a team name is available (unique).
   * @param name The name to check.
   * @param excludeId Optional ID of the team to exclude from the check (useful for updates).
   * @returns True if the name is available, false otherwise.
   */
  static isNameAvailable(name: string, excludeId?: string): boolean {
    const team = TeamRepository.findByName(name);
    if (!team) return true;
    return team.id === excludeId;
  }

  /**
   * Creates a new team with the specified name and objective.
   * @param name The name of the team.
   * @param objective The objective of the team.
   * @returns The newly created team.
   * @throws Error if the name is empty or already exists.
   */
  static createTeam(name: string, objective: string): Team {
    if (!name || name.trim() === '') {
      throw new Error('Team name is required.');
    }
    if (!this.isNameAvailable(name)) {
      throw new Error(`Team name "${name}" is already taken.`);
    }
    const id = crypto.randomUUID();
    TeamRepository.create(id, name, objective);
    const startAgent: Agent = {
      id: `agent-start-${crypto.randomUUID()}`,
      team_id: id,
      persona_id: 'persona-start',
      persona_name: 'Start',
      description: 'Workflow entry point.',
      status: 'done',
      summary: 'Workflow entry point.',
      tokensUsed: 0,
      input_schema: [],
      output_schema: [],
      logs: ['Start node initialized.'],
      pos_x: 120,
      pos_y: 200,
    };
    const endAgent: Agent = {
      id: `agent-end-${crypto.randomUUID()}`,
      team_id: id,
      persona_id: 'persona-end',
      persona_name: 'End',
      description: 'Workflow completion point.',
      status: 'waiting_approval',
      summary: 'Workflow completion point.',
      tokensUsed: 0,
      input_schema: [],
      output_schema: [],
      logs: ['End node initialized.'],
      pos_x: 520,
      pos_y: 200,
    };

    AgentRepository.create(startAgent);
    AgentRepository.create(endAgent);
    ConnectionRepository.create({
      team_id: id,
      source_id: startAgent.id,
      source_handle: null,
      target_id: endAgent.id,
      target_handle: null,
    });

    const team = TeamRepository.findById(id);
    if (!team) {
      throw new Error('Failed to create team.');
    }
    return this.hydrateTeam(team);
  }

  /**
   * Updates an existing team's name and objective.
   * @param id The ID of the team.
   * @param name The new name.
   * @param objective The new objective.
   * @param agents
   * @param connections
   * @throws Error if the name is empty or already exists for another team.
   */
  static updateTeam(
    id: string,
    name: string,
    objective: string,
    agents?: Agent[],
    connections?: {
      source: string;
      source_handle?: string;
      target: string;
      target_handle?: string;
    }[]
  ): void {
    if (!name || name.trim() === '') {
      throw new Error('Team name is required.');
    }
    if (!this.isNameAvailable(name, id)) {
      throw new Error(`Team name "${name}" is already taken.`);
    }
    if (agents && connections) {
      this.ensureStartEndAndPath({ id, name, objective, agents, connections });
    } else {
      const current = this.getTeamById(id);
      if (current) {
        this.ensureStartEndAndPath(current);
      }
    }
    TeamRepository.update(id, name, objective);
    if (agents && connections) {
      this.syncAgents(id, agents);
      this.syncConnections(id, connections);
    }
  }

  /**
   * Deletes a team and all its associated data (via cascading deletes).
   * @param id The ID of the team to delete.
   */
  static deleteTeam(id: string): void {
    TeamRepository.delete(id);
  }

  /**
   * Returns the next agents that are ready to begin work.
   * @param teamId The ID of the team.
   * @returns A list of ready agents.
   */
  static getNextAgents(teamId: string): Agent[] {
    const team = this.getTeamById(teamId);
    if (!team) {
      throw new Error('Team not found.');
    }
    return this.computeNextAgents(team);
  }

  /**
   * Computes the next agents ready to begin work for a team.
   * @param team The team to evaluate.
   * @returns A list of ready agents in the workflow.
   */
  private static computeNextAgents(team: Team): Agent[] {
    const startAgents = team.agents.filter(
      (a) => a.persona_name === 'Start' || a.persona_id === 'persona-start'
    );
    if (startAgents.length !== 1) {
      return [];
    }
    const startId = startAgents[0].id;
    const agentsById = new Map(team.agents.map((a) => [a.id, a]));
    const incoming = new Map<string, string[]>();
    const outgoing = new Map<string, string[]>();

    for (const conn of team.connections) {
      if (!agentsById.has(conn.source) || !agentsById.has(conn.target)) continue;
      const inList = incoming.get(conn.target) || [];
      inList.push(conn.source);
      incoming.set(conn.target, inList);
      const outList = outgoing.get(conn.source) || [];
      outList.push(conn.target);
      outgoing.set(conn.source, outList);
    }

    const reachable = new Set<string>();
    const queue = [startId];
    while (queue.length > 0) {
      const current = queue.shift()!;
      if (reachable.has(current)) continue;
      reachable.add(current);
      const next = outgoing.get(current) || [];
      for (const id of next) queue.push(id);
    }

    const ready: Agent[] = [];
    for (const agent of team.agents) {
      if (!reachable.has(agent.id)) continue;
      if (agent.id === startId) continue;
      if (agent.status === 'done') continue;
      const preds = incoming.get(agent.id) || [];
      if (preds.length === 0) continue;
      const allDone = preds.every((id) => agentsById.get(id)?.status === 'done');
      if (allDone) ready.push(agent);
    }
    return ready;
  }

  /**
   * Validates that a team has exactly one Start and End node and a valid path between them.
   * @param team The team to validate.
   */
  private static ensureStartEndAndPath(team: Team): void {
    const startAgents = team.agents.filter(
      (a) => a.persona_name === 'Start' || a.persona_id === 'persona-start'
    );
    const endAgents = team.agents.filter(
      (a) => a.persona_name === 'End' || a.persona_id === 'persona-end'
    );
    if (startAgents.length !== 1) {
      throw new Error('Team must include exactly one Start node.');
    }
    if (endAgents.length !== 1) {
      throw new Error('Team must include exactly one End node.');
    }

    const agentIds = new Set(team.agents.map((a) => a.id));
    for (const conn of team.connections) {
      if (!agentIds.has(conn.source) || !agentIds.has(conn.target)) {
        throw new Error('All connections must reference valid agents.');
      }
    }

    const startId = startAgents[0].id;
    const endId = endAgents[0].id;
    const outgoing = new Map<string, string[]>();
    for (const conn of team.connections) {
      const list = outgoing.get(conn.source) || [];
      list.push(conn.target);
      outgoing.set(conn.source, list);
    }

    const visited = new Set<string>();
    const stack = [startId];
    while (stack.length > 0) {
      const current = stack.pop()!;
      if (visited.has(current)) continue;
      visited.add(current);
      const next = outgoing.get(current) || [];
      for (const id of next) stack.push(id);
    }

    if (!visited.has(endId)) {
      throw new Error('A valid path from Start to End is required.');
    }
  }

  /**
   * Reconciles agent records for a team with the provided list.
   * @param teamId The team ID.
   * @param agents The desired list of agents.
   */
  private static syncAgents(teamId: string, agents: Agent[]): void {
    const existing = AgentRepository.findByTeamId(teamId);
    const existingIds = new Set(existing.map((a) => a.id));
    const incomingIds = new Set(agents.map((a) => a.id));

    for (const agent of existing) {
      if (!incomingIds.has(agent.id)) {
        AgentRepository.delete(agent.id);
      }
    }

    for (const agent of agents) {
      if (existingIds.has(agent.id)) {
        AgentRepository.update(agent);
      } else {
        AgentRepository.create(agent);
      }
    }
  }

  /**
   * Replaces all connections for a team with the provided list.
   * @param teamId The team ID.
   * @param connections The desired list of connections.
   */
  private static syncConnections(
    teamId: string,
    connections: {
      source: string;
      source_handle?: string;
      target: string;
      target_handle?: string;
    }[]
  ): void {
    ConnectionRepository.replaceForTeam(teamId, connections);
  }

  /**
   * Hydrates a database team object with its related agents, logs, and connections.
   * @param team The database team object.
   * @returns The fully hydrated team domain object.
   */
  private static hydrateTeam(team: DBTeam): Team {
    const agents = AgentRepository.findByTeamId(team.id);
    const connections = ConnectionRepository.findByTeamId(team.id);
    const personasById = new Map(
      PersonaRepository.findAll().map((persona) => [persona.id, persona])
    );

    const agentsWithLogs: Agent[] = agents.map((agent) => {
      const logs = AgentRepository.findLogsByAgentId(agent.id);
      const persona = agent.personaId ? personasById.get(agent.personaId) : null;
      return {
        id: agent.id,
        team_id: agent.teamId,
        persona_id: agent.personaId || undefined,
        persona_name: persona?.name || 'Agent',
        description: persona?.description || persona?.name || 'Agent',
        status: agent.status,
        summary: agent.summary || '',
        tokensUsed: agent.tokensUsed || 0,
        input_schema: JSON.parse(agent.inputSchema || '[]'),
        output_schema: JSON.parse(agent.outputSchema || '[]'),
        pos_x: agent.posX || 0,
        pos_y: agent.posY || 0,
        logs,
      };
    });

    const mappedConnections = connections.map((c) => ({
      source: c.sourceId,
      source_handle: c.sourceHandle || undefined,
      target: c.targetId,
      target_handle: c.targetHandle || undefined,
    }));

    return {
      id: team.id,
      name: team.name,
      objective: team.objective || '',
      agents: agentsWithLogs,
      connections: mappedConnections,
    };
  }
}
