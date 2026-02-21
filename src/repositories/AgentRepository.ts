import db from '@/db/schema';
import { DBAgent, Agent } from '@/types';

/**
 * Repository for managing agents in the database.
 */
export class AgentRepository {
  /**
   * Finds agents belonging to a specific team.
   * @param teamId The ID of the team.
   * @returns A list of database agents.
   */
  static findByTeamId(teamId: string): DBAgent[] {
    return db.prepare('SELECT * FROM agents WHERE team_id = ?').all(teamId) as DBAgent[];
  }

  /**
   * Finds all logs for a specific agent.
   * @param agentId The ID of the agent.
   * @returns A list of log contents.
   */
  static findLogsByAgentId(agentId: string): string[] {
    const logs = db
      .prepare('SELECT content FROM logs WHERE agent_id = ? ORDER BY timestamp ASC')
      .all(agentId) as { content: string }[];
    return logs.map((l) => l.content);
  }

  /**
   * Creates a new agent in the database.
   * @param agent The agent object to create.
   */
  static create(agent: Agent): void {
    db.prepare(
      `
      INSERT INTO agents (id, team_id, role, status, summary, tokens_used, input_schema, output_schema, pos_x, pos_y)
      VALUES ($id, $team_id, $role, $status, $summary, $tokens_used, $input_schema, $output_schema, $pos_x, $pos_y)
    `
    ).run({
      $id: agent.id,
      $team_id: agent.team_id,
      $role: agent.role,
      $status: agent.status,
      $summary: agent.summary || '',
      $tokens_used: agent.tokensUsed || 0,
      $input_schema: JSON.stringify(agent.input_schema || []),
      $output_schema: JSON.stringify(agent.output_schema || []),
      $pos_x: agent.pos_x || 0,
      $pos_y: agent.pos_y || 0,
    });
  }
}
