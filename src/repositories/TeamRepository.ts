import db from '@/db/schema';
import { DBTeam } from '@/types';

export class TeamRepository {
  static findAll(): DBTeam[] {
    return db.prepare('SELECT * FROM teams ORDER BY created_at DESC').all() as DBTeam[];
  }

  static findById(id: string): DBTeam | null {
    return db.prepare('SELECT * FROM teams WHERE id = ?').get(id) as DBTeam | null;
  }

  static create(id: string, name: string, objective: string): void {
    db.prepare('INSERT INTO teams (id, name, objective) VALUES (?, ?, ?)').run(id, name, objective);
  }
}
