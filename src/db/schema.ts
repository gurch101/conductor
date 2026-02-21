import { Database } from 'bun:sqlite';

const db = new Database('conductor.sqlite', { create: true });

export function initDb() {
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

  db.run(`
    CREATE TABLE IF NOT EXISTS connections (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      team_id TEXT NOT NULL,
      source_id TEXT NOT NULL,
      source_handle TEXT,
      target_id TEXT NOT NULL,
      target_handle TEXT,
      FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
      FOREIGN KEY (source_id) REFERENCES agents(id) ON DELETE CASCADE,
      FOREIGN KEY (target_id) REFERENCES agents(id) ON DELETE CASCADE
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      agent_id TEXT NOT NULL,
      content TEXT NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE CASCADE
    );
  `);

  // Seed Personas if empty
  const personaCount = db.prepare('SELECT COUNT(*) as count FROM personas').get() as {
    count: number;
  };
  if (personaCount.count === 0) {
    const seedPersonas = [
      {
        id: 'p1',
        name: 'Researcher',
        avatar: '🔍',
        system_prompt: 'You are an expert researcher...',
        input_schema: JSON.stringify([{ name: 'topic', type: 'text' }]),
        output_schema: JSON.stringify([{ name: 'findings', type: 'markdown' }]),
      },
      {
        id: 'p2',
        name: 'Coder',
        avatar: '💻',
        system_prompt: 'You are an expert software engineer...',
        input_schema: JSON.stringify([{ name: 'spec', type: 'markdown' }]),
        output_schema: JSON.stringify([{ name: 'code', type: 'text' }]),
      },
    ];

    const insert = db.prepare(
      'INSERT INTO personas (id, name, avatar, system_prompt, input_schema, output_schema) VALUES ($id, $name, $avatar, $system_prompt, $input_schema, $output_schema)'
    );
    for (const p of seedPersonas) {
      insert.run({
        $id: p.id,
        $name: p.name,
        $avatar: p.avatar,
        $system_prompt: p.system_prompt,
        $input_schema: p.input_schema,
        $output_schema: p.output_schema,
      });
    }
  }
}

export default db;
