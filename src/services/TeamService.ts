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
    return { id, name, objective, agents: [], connections: [] };
  }

  /**
   * Updates an existing team's name and objective.
   * @param id The ID of the team.
   * @param name The new name.
   * @param objective The new objective.
   * @throws Error if the name is empty or already exists for another team.
   */
  static updateTeam(id: string, name: string, objective: string): void {
    if (!name || name.trim() === '') {
      throw new Error('Team name is required.');
    }
    if (!this.isNameAvailable(name, id)) {
      throw new Error(`Team name "${name}" is already taken.`);
    }
    TeamRepository.update(id, name, objective);
  }

  /**
   * Deletes a team and all its associated data (via cascading deletes).
   * @param id The ID of the team to delete.
   */
  static deleteTeam(id: string): void {
    TeamRepository.delete(id);
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
