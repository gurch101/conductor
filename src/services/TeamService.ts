import { TeamRepository } from '@/repositories/TeamRepository';
import { AgentRepository } from '@/repositories/AgentRepository';
import { ConnectionRepository } from '@/repositories/ConnectionRepository';
import { Team, Agent, DBTeam } from '@/types';

export class TeamService {
  static getAllTeams(): Team[] {
    const teams = TeamRepository.findAll();
    return teams.map((team) => this.hydrateTeam(team));
  }

  static getTeamById(id: string): Team | null {
    const team = TeamRepository.findById(id);
    if (!team) return null;
    return this.hydrateTeam(team);
  }

  static createTeam(name: string, objective: string): Team {
    const id = crypto.randomUUID();
    TeamRepository.create(id, name, objective);
    return { id, name, objective, agents: [], connections: [] };
  }

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
