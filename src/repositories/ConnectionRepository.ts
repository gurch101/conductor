import db from '@/db/schema';
import { DBConnection } from '@/types';

export class ConnectionRepository {
  static findByTeamId(teamId: string): DBConnection[] {
    return db.prepare('SELECT * FROM connections WHERE team_id = ?').all(teamId) as DBConnection[];
  }

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
