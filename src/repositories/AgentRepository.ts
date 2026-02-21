import db, { agents, logs } from '@/db';
import type { DBAgent, Agent } from '@/types';
import type { AgentStatusValue } from '@/constants/agentStatus';
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
   * Finds agents associated with a specific persona.
   * @param personaId The ID of the persona.
   * @returns A list of database agents.
   */
  static findByPersonaId(personaId: string): DBAgent[] {
    return db.select().from(agents).where(eq(agents.personaId, personaId)).all();
  }

  /**
   * Finds a single agent by its ID.
   * @param id The ID of the agent.
   * @returns The database agent or null if not found.
   */
  static findById(id: string): DBAgent | null {
    const result = db.select().from(agents).where(eq(agents.id, id)).get();
    return result || null;
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
        personaId: agent.persona_id || null,
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

  /**
   * Deletes an agent from the database.
   * @param id The ID of the agent to delete.
   */
  static delete(id: string): void {
    db.delete(agents).where(eq(agents.id, id)).run();
  }

  /**
   * Updates an agent's canvas position.
   * @param id The ID of the agent.
   * @param posX The X position on the canvas.
   * @param posY The Y position on the canvas.
   */
  static updatePosition(id: string, posX: number, posY: number): void {
    db.update(agents).set({ posX, posY }).where(eq(agents.id, id)).run();
  }

  /**
   * Updates an agent's persisted fields.
   * @param agent The agent data to persist.
   */
  static update(agent: Agent): void {
    db.update(agents)
      .set({
        personaId: agent.persona_id || null,
        status: agent.status,
        summary: agent.summary || '',
        tokensUsed: agent.tokensUsed || 0,
        inputSchema: JSON.stringify(agent.input_schema || []),
        outputSchema: JSON.stringify(agent.output_schema || []),
        posX: agent.pos_x || 0,
        posY: agent.pos_y || 0,
      })
      .where(eq(agents.id, agent.id))
      .run();
  }

  /**
   * Updates an agent's execution status.
   * @param id The ID of the agent.
   * @param status The new status.
   */
  static updateStatus(id: string, status: AgentStatusValue): void {
    db.update(agents).set({ status }).where(eq(agents.id, id)).run();
  }

  /**
   * Appends a log message for an agent.
   * @param agentId The ID of the agent.
   * @param content The log message.
   */
  static addLog(agentId: string, content: string): void {
    db.insert(logs).values({ agentId, content }).run();
  }
}
