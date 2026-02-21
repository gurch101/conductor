import db from '@/db/schema';
import { DBConnection } from '@/types';

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
    return db.prepare('SELECT * FROM connections WHERE team_id = ?').all(teamId) as DBConnection[];
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
    db.prepare(
      `
       INSERT INTO connections (team_id, source_id, source_handle, target_id, target_handle)
       VALUES (?, ?, ?, ?, ?)
     `
    ).run(data.team_id, data.source_id, data.source_handle, data.target_id, data.target_handle);
  }
}
