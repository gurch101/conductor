import db, { personas } from '@/db';
import type { DBPersona } from '@/types';

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
}
