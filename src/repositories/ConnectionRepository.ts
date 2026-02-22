import db, { connections } from '@/db';
import type { DBConnection } from '@/types';
import { eq } from 'drizzle-orm';
import { and, isNull } from 'drizzle-orm';

/**
 * Repository for managing agent connections in the database.
 */
export class ConnectionRepository {
  /**
   * Finds connections belonging to a specific team.
   * @param teamId The ID of the team.
   * @returns A list of database connections.
   */
  static findByTeamId(teamId: string): DBConnection[] {
    return db.select().from(connections).where(eq(connections.teamId, teamId)).all();
  }

  /**
   * Creates a new connection in the database.
   * @param data The connection data.
   * @param data.team_id The ID of the team.
   * @param data.source_id The ID of the source agent.
   * @param data.source_handle The handle of the source agent's output.
   * @param data.target_id The ID of the target agent.
   * @param data.target_handle The handle of the target agent's input.
   */
  static create(data: {
    team_id: string;
    source_id: string;
    source_handle: string | null;
    target_id: string;
    target_handle: string | null;
  }): void {
    db.insert(connections)
      .values({
        teamId: data.team_id,
        sourceId: data.source_id,
        sourceHandle: data.source_handle,
        targetId: data.target_id,
        targetHandle: data.target_handle,
      })
      .run();
  }

  /**
   * Deletes a connection from the database.
   * @param data The connection data identifying the row to remove.
   * @param data.team_id The ID of the team.
   * @param data.source_id The ID of the source agent.
   * @param data.source_handle The handle of the source agent's output.
   * @param data.target_id The ID of the target agent.
   * @param data.target_handle The handle of the target agent's input.
   */
  static delete(data: {
    team_id: string;
    source_id: string;
    source_handle: string | null;
    target_id: string;
    target_handle: string | null;
  }): void {
    db.delete(connections)
      .where(
        and(
          eq(connections.teamId, data.team_id),
          eq(connections.sourceId, data.source_id),
          data.source_handle === null
            ? isNull(connections.sourceHandle)
            : eq(connections.sourceHandle, data.source_handle),
          eq(connections.targetId, data.target_id),
          data.target_handle === null
            ? isNull(connections.targetHandle)
            : eq(connections.targetHandle, data.target_handle)
        )
      )
      .run();
  }

  /**
   * Replaces all connections for a team.
   * @param teamId The ID of the team.
   * @param connections The new connections list.
   */
  static replaceForTeam(
    teamId: string,
    nextConnections: {
      source: string;
      source_handle?: string;
      target: string;
      target_handle?: string;
    }[]
  ): void {
    db.delete(connections).where(eq(connections.teamId, teamId)).run();
    for (const conn of nextConnections) {
      db.insert(connections)
        .values({
          teamId,
          sourceId: conn.source,
          sourceHandle: conn.source_handle || null,
          targetId: conn.target,
          targetHandle: conn.target_handle || null,
        })
        .run();
    }
  }
}
