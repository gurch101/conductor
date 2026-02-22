import db, { teams } from '@/db';
import type { DBTeam } from '@/types';
import { eq, desc } from 'drizzle-orm';

/**
 * Repository for managing teams in the database.
 */
export class TeamRepository {
  /**
   * Retrieves all teams from the database, ordered by creation date.
   * @returns A list of database teams.
   */
  static findAll(): DBTeam[] {
    return db.select().from(teams).orderBy(desc(teams.createdAt)).all();
  }

  /**
   * Finds a specific team by its ID.
   * @param id The ID of the team.
   * @returns The database team or null if not found.
   */
  static findById(id: string): DBTeam | null {
    const result = db.select().from(teams).where(eq(teams.id, id)).get();
    return result || null;
  }

  /**
   * Finds a specific team by its name.
   * @param name The name of the team.
   * @returns The database team or null if not found.
   */
  static findByName(name: string): DBTeam | null {
    const result = db.select().from(teams).where(eq(teams.name, name)).get();
    return result || null;
  }

  /**
   * Creates a new team in the database.
   * @param id The ID of the team.
   * @param name The name of the team.
   */
  static create(id: string, name: string): void {
    db.insert(teams).values({ id, name }).run();
  }

  /**
   * Updates an existing team's name.
   * @param id The ID of the team to update.
   * @param name The new name.
   */
  static update(id: string, name: string): void {
    db.update(teams).set({ name }).where(eq(teams.id, id)).run();
  }

  /**
   * Deletes a team from the database.
   * @param id The ID of the team to delete.
   */
  static delete(id: string): void {
    db.delete(teams).where(eq(teams.id, id)).run();
  }
}
