import { TeamRepository } from '@/repositories/TeamRepository';
import { AgentRepository } from '@/repositories/AgentRepository';
import { ConnectionRepository } from '@/repositories/ConnectionRepository';
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
   * Creates a new team with the specified name and objective.
   * @param name The name of the team.
   * @param objective The objective of the team.
   * @returns The newly created team.
   */
  static createTeam(name: string, objective: string): Team {
    const id = crypto.randomUUID();
    TeamRepository.create(id, name, objective);
    return { id, name, objective, agents: [], connections: [] };
  }

  /**
   * Hydrates a database team object with its related agents, logs, and connections.
   * @param team The database team object.
   * @returns The fully hydrated team domain object.
   */
  private static hydrateTeam(team: DBTeam): Team {
    const agents = AgentRepository.findByTeamId(team.id);
    const connections = ConnectionRepository.findByTeamId(team.id);

    const agentsWithLogs: Agent[] = agents.map((agent) => {
      const logs = AgentRepository.findLogsByAgentId(agent.id);
      return {
        id: agent.id,
        team_id: agent.teamId,
        role: agent.role,
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
