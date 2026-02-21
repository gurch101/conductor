import { describe, it, expect, beforeAll } from 'bun:test';
import { Database } from 'bun:sqlite';

import { DBTeam } from '@/types';

let testDb: Database;

function initTestDb(db: Database) {
  db.run('PRAGMA foreign_keys = ON;');
  db.run(`
    CREATE TABLE IF NOT EXISTS teams (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      objective TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS personas (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      avatar TEXT,
      system_prompt TEXT NOT NULL,
      input_schema TEXT DEFAULT '[]',
      output_schema TEXT DEFAULT '[]'
    );
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS agents (
      id TEXT PRIMARY KEY,
      team_id TEXT NOT NULL,
      role TEXT NOT NULL,
      status TEXT CHECK(status IN ('done', 'working', 'waiting_approval')) DEFAULT 'working',
      summary TEXT,
      tokens_used INTEGER DEFAULT 0,
      input_schema TEXT,
      output_schema TEXT,
      pos_x REAL DEFAULT 0,
      pos_y REAL DEFAULT 0,
      FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE
    );
  `);
}

describe('Database Schema', () => {
  beforeAll(() => {
    testDb = new Database(':memory:');
    initTestDb(testDb);
  });

  it('should create a team correctly', () => {
    const id = 'test-team-1';
    testDb
      .prepare('INSERT INTO teams (id, name, objective) VALUES (?, ?, ?)')
      .run(id, 'Test Team', 'Test Objective');

    const team = testDb.prepare('SELECT * FROM teams WHERE id = ?').get(id) as DBTeam;
    expect(team).toBeDefined();
    expect(team.name).toBe('Test Team');
  });

  it('should cascade delete agents when team is deleted', () => {
    const teamId = 'cascade-test-team';
    const agentId = 'cascade-test-agent';

    testDb.prepare('INSERT INTO teams (id, name) VALUES (?, ?)').run(teamId, 'Cascade Team');
    testDb
      .prepare('INSERT INTO agents (id, team_id, role) VALUES (?, ?, ?)')
      .run(agentId, teamId, 'Tester');

    const agentBefore = testDb.prepare('SELECT * FROM agents WHERE id = ?').get(agentId);
    expect(agentBefore).toBeDefined();

    testDb.prepare('DELETE FROM teams WHERE id = ?').run(teamId);

    const agentAfter = testDb.prepare('SELECT * FROM agents WHERE id = ?').get(agentId);
    expect(agentAfter).toBeNull();
  });
});
