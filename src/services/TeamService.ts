import { TeamRepository } from '@/repositories/TeamRepository';
import { AgentRepository } from '@/repositories/AgentRepository';
import { ConnectionRepository } from '@/repositories/ConnectionRepository';
import { PersonaRepository } from '@/repositories/PersonaRepository';
import { AgentStatus } from '@/constants/agentStatus';
import { TeamStreamService } from '@/services/TeamStreamService';
import type { Team, Agent, DBTeam } from '@/types';

/**
 * Service for managing teams and their associated agents and connections.
 */
export class TeamService {
  /**
   * Returns true when an agent is a built-in orchestration/system node.
   * @param agent The agent to classify.
   * @returns True when the agent is Start, End, or Gateway.
   */
  private static isSystemAgent(agent: Agent): boolean {
    return (
      agent.persona_id === 'persona-start' ||
      agent.persona_id === 'persona-end' ||
      agent.persona_id === 'persona-gateway' ||
      agent.persona_name === 'Start' ||
      agent.persona_name === 'End' ||
      agent.persona_name === 'Gateway' ||
      agent.id.startsWith('agent-start-') ||
      agent.id.startsWith('agent-end-')
    );
  }

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
   * Creates a new team with the specified name.
   * @param name The name of the team.
   * @returns The newly created team.
   * @throws Error if the name is empty or already exists.
   */
  static createTeam(name: string): Team {
    if (!name || name.trim() === '') {
      throw new Error('Team name is required.');
    }
    if (!this.isNameAvailable(name)) {
      throw new Error(`Team name "${name}" is already taken.`);
    }
    const id = crypto.randomUUID();
    TeamRepository.create(id, name);
    const startAgent: Agent = {
      id: `agent-start-${crypto.randomUUID()}`,
      team_id: id,
      persona_id: 'persona-start',
      persona_name: 'Start',
      description: 'Workflow entry point.',
      status: AgentStatus.Done,
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
      status: AgentStatus.Ready,
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
   * Updates an existing team's name.
   * @param id The ID of the team.
   * @param name The new name.
   * @param agents
   * @param connections
   * @throws Error if the name is empty or already exists for another team.
   */
  static updateTeam(
    id: string,
    name: string,
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
      this.ensureStartEndAndPath({ id, name, agents, connections });
    } else {
      const current = this.getTeamById(id);
      if (current) {
        this.ensureStartEndAndPath(current);
      }
    }
    TeamRepository.update(id, name);
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
    if (TeamStreamService.hasActiveSubscribers(id)) {
      throw new Error('Cannot delete a team that is currently active.');
    }
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
      if (agent.status === AgentStatus.Done) continue;
      const preds = incoming.get(agent.id) || [];
      if (preds.length === 0) continue;
      const allDone = preds.every((id) => agentsById.get(id)?.status === AgentStatus.Done);
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
    const activeAgents = team.agents.filter((a) => !this.isSystemAgent(a));
    if (activeAgents.length === 0) {
      throw new Error('Team must include at least one non-system agent.');
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
   * Starts orchestration for a team and seeds initial runtime state.
   * @param id The ID of the team.
   * @param initialGoal
   * @returns The updated hydrated team.
   * @throws Error if the team does not exist or has no agents.
   */
  static startTeam(id: string, initialGoal: string): Team {
    const team = TeamRepository.findById(id);
    if (!team) {
      throw new Error('Team not found.');
    }

    const agents = AgentRepository.findByTeamId(id);
    if (agents.length === 0) {
      throw new Error('Cannot start a team with no agents.');
    }

    const activeAgents = agents.filter(
      (agent) =>
        agent.personaId !== 'persona-start' &&
        agent.personaId !== 'persona-end' &&
        agent.personaId !== 'persona-gateway'
    );
    if (activeAgents.length === 0) {
      throw new Error('Cannot start a team with only system agents.');
    }

    if (!initialGoal || initialGoal.trim() === '') {
      throw new Error('Initial goal is required to start a team.');
    }

    for (const agent of activeAgents) {
      if (agent.status !== AgentStatus.Done) {
        AgentRepository.updateStatus(agent.id, AgentStatus.Working);
      }
    }

    const nextAgents = this.getNextAgents(id).filter(
      (agent) =>
        agent.persona_id !== 'persona-start' &&
        agent.persona_id !== 'persona-end' &&
        agent.persona_id !== 'persona-gateway'
    );
    const leadAgent =
      nextAgents[0] ||
      activeAgents.find((agent) => agent.status !== AgentStatus.Done) ||
      activeAgents[0]!;
    AgentRepository.addLog(leadAgent.id, 'Orchestrator started team execution.');
    AgentRepository.addLog(leadAgent.id, `Initial goal: ${initialGoal.trim()}`);

    const reviewerAgent = activeAgents.find(
      (agent) => agent.id !== leadAgent.id && agent.status !== AgentStatus.Done
    );
    const approvalAgent = reviewerAgent || leadAgent;
    AgentRepository.updateStatus(approvalAgent.id, AgentStatus.WaitingForFeedback);
    AgentRepository.addLog(
      approvalAgent.id,
      'Needs clarification and access approval before continuing execution.'
    );

    return this.hydrateTeam(team);
  }

  /**
   * Posts a human response to an agent during orchestration.
   * @param teamId The team ID.
   * @param agentId The target agent ID.
   * @param message The user's response.
   * @returns The updated hydrated team.
   * @throws Error if team, agent, or message is invalid.
   */
  static respondToAgent(teamId: string, agentId: string, message: string): Team {
    const team = TeamRepository.findById(teamId);
    if (!team) {
      throw new Error('Team not found.');
    }

    if (!message || message.trim() === '') {
      throw new Error('Response message is required.');
    }

    const agent = AgentRepository.findById(agentId);
    if (!agent || agent.teamId !== teamId) {
      throw new Error('Agent not found for this team.');
    }

    AgentRepository.addLog(agentId, `Human response: ${message.trim()}`);
    AgentRepository.updateStatus(agentId, AgentStatus.Working);
    AgentRepository.addLog(agentId, 'Human response received. Continuing execution.');

    return this.hydrateTeam(team);
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
      agents: agentsWithLogs,
      connections: mappedConnections,
    };
  }
}
