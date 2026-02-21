import db from '@/db/schema';
import type { DBTeam } from '@/types';

/**
 * Repository for managing teams in the database.
 */
export class TeamRepository {
  /**
   * Retrieves all teams from the database, ordered by creation date.
   * @returns A list of database teams.
   */
  static findAll(): DBTeam[] {
    return db.prepare('SELECT * FROM teams ORDER BY created_at DESC').all() as DBTeam[];
  }

  /**
   * Finds a specific team by its ID.
   * @param id The ID of the team.
   * @returns The database team or null if not found.
   */
  static findById(id: string): DBTeam | null {
    return db.prepare('SELECT * FROM teams WHERE id = ?').get(id) as DBTeam | null;
  }

  /**
   * Creates a new team in the database.
   * @param id The ID of the team.
   * @param name The name of the team.
   * @param objective The team's objective.
   */
  static create(id: string, name: string, objective: string): void {
    db.prepare('INSERT INTO teams (id, name, objective) VALUES (?, ?, ?)').run(id, name, objective);
  }
}
