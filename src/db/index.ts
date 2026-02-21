import { Database } from 'bun:sqlite';
import { drizzle } from 'drizzle-orm/bun-sqlite';
import { migrate } from 'drizzle-orm/bun-sqlite/migrator';
import * as schema from './schema';

const dbPath =
  process.env.DATABASE_PATH || (process.env.NODE_ENV === 'test' ? ':memory:' : 'conductor.sqlite');
const sqlite = new Database(dbPath, { create: true });
export const db = drizzle(sqlite, { schema });

export function initDb() {
  sqlite.run('PRAGMA foreign_keys = ON;');

  // Automatically migrate the database schema
  migrate(db, { migrationsFolder: 'drizzle' });

  // Seed Personas if empty
  const personaCount = sqlite.prepare('SELECT COUNT(*) as count FROM personas').get() as {
    count: number;
  };
  if (personaCount.count === 0) {
    db.insert(schema.personas)
      .values([
        {
          id: 'p1',
          name: 'Researcher',
          avatar: '🔍',
          systemPrompt: 'You are an expert researcher...',
          inputSchema: JSON.stringify([{ name: 'topic', type: 'text' }]),
          outputSchema: JSON.stringify([{ name: 'findings', type: 'markdown' }]),
        },
        {
          id: 'p2',
          name: 'Coder',
          avatar: '💻',
          systemPrompt: 'You are an expert software engineer...',
          inputSchema: JSON.stringify([{ name: 'spec', type: 'markdown' }]),
          outputSchema: JSON.stringify([{ name: 'code', type: 'text' }]),
        },
      ])
      .run();
  }
}

export * from './schema';
export default db;
