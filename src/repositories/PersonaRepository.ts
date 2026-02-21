import db from '@/db/schema';
import { DBPersona } from '@/types';

/**
 * Repository for managing personas in the database.
 */
export class PersonaRepository {
  /**
   * Retrieves all personas from the database.
   * @returns A list of personas.
   */
  static findAll(): DBPersona[] {
    return db.prepare('SELECT * FROM personas').all() as DBPersona[];
  }
}
