import db, { agents, logs } from '@/db';
import type { DBAgent, Agent } from '@/types';
import { eq, asc } from 'drizzle-orm';

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
    return db.select().from(agents).where(eq(agents.teamId, teamId)).all();
  }

  /**
   * Finds all logs for a specific agent.
   * @param agentId The ID of the agent.
   * @returns A list of log contents.
   */
  static findLogsByAgentId(agentId: string): string[] {
    const result = db
      .select({ content: logs.content })
      .from(logs)
      .where(eq(logs.agentId, agentId))
      .orderBy(asc(logs.timestamp))
      .all();
    return result.map((l) => l.content);
  }

  /**
   * Creates a new agent in the database.
   * @param agent The agent object to create.
   */
  static create(agent: Agent): void {
    db.insert(agents)
      .values({
        id: agent.id,
        teamId: agent.team_id,
        role: agent.role,
        status: agent.status,
        summary: agent.summary || '',
        tokensUsed: agent.tokensUsed || 0,
        inputSchema: JSON.stringify(agent.input_schema || []),
        outputSchema: JSON.stringify(agent.output_schema || []),
        posX: agent.pos_x || 0,
        posY: agent.pos_y || 0,
      })
      .run();
  }
}
