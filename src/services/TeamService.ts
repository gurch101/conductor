import { TeamRepository } from '@/repositories/TeamRepository';
import { AgentRepository } from '@/repositories/AgentRepository';
import { ConnectionRepository } from '@/repositories/ConnectionRepository';
import { Team, Agent, DBTeam } from '@/types';

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
        ...agent,
        tokensUsed: agent.tokens_used,
        input_schema: JSON.parse(agent.input_schema || '[]'),
        output_schema: JSON.parse(agent.output_schema || '[]'),
        logs,
      };
    });

    const mappedConnections = connections.map((c) => ({
      source: c.source_id,
      source_handle: c.source_handle || undefined,
      target: c.target_id,
      target_handle: c.target_handle || undefined,
    }));

    return { ...team, agents: agentsWithLogs, connections: mappedConnections };
  }
}
