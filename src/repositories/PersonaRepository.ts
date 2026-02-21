import db, { personas } from '@/db';
import type { DBPersona } from '@/types';
import { eq } from 'drizzle-orm';

/**
 * Repository for managing personas in the database.
 */
export class PersonaRepository {
  /**
   * Retrieves all personas from the database.
   * @returns A list of personas.
   */
  static findAll(): DBPersona[] {
    return db.select().from(personas).all();
  }

  /**
   * Deletes a persona from the database.
   * @param id The ID of the persona to delete.
   */
  static delete(id: string): void {
    db.delete(personas).where(eq(personas.id, id)).run();
  }
}
