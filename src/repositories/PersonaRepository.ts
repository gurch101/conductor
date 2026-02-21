import db from '@/db/schema';
import { DBPersona } from '@/types';

export class PersonaRepository {
  static findAll(): DBPersona[] {
    return db.prepare('SELECT * FROM personas').all() as DBPersona[];
  }
}
