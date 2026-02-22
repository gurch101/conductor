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

  // Ensure required personas exist and stay up to date.
  const defaultPersonas = [
    {
      id: 'persona-product-manager',
      name: 'Product Manager',
      avatar: '📌',
      description: 'Leads discovery and produces PRD.',
      skill: 'product-owner-discovery-spec',
    },
    {
      id: 'persona-business-analyst',
      name: 'Business Analyst (BA)',
      avatar: '📊',
      description: 'Translates high-level requirements in the PRD to detailed requirements.',
      skill: 'product-owner-discovery-spec',
    },
    {
      id: 'persona-solutions-architect',
      name: 'Solutions Architect',
      avatar: '🏗️',
      description: 'Defines how software will be structured to meet requirements.',
      skill: 'solutions-architect',
    },
    {
      id: 'persona-developer',
      name: 'Developer',
      avatar: '💻',
      description: 'Takes requirements and implements features.',
      skill: 'coding-implementation',
    },
    {
      id: 'persona-qa-tester',
      name: 'QA Tester',
      avatar: '🧪',
      description: 'Validates quality and expected behavior through testing.',
      skill: 'qa-testing',
    },
    {
      id: 'persona-devops-engineer',
      name: 'DevOps Engineer',
      avatar: '⚙️',
      description: 'Builds and operates deployment and runtime workflows.',
      skill: 'devops-engineering',
    },
    {
      id: 'persona-code-reviewer',
      name: 'Code Reviewer',
      avatar: '🔍',
      description: 'Reviews code changes for correctness, style, and maintainability.',
      skill: 'code-reviewer',
    },
    {
      id: 'persona-architecture-reviewer',
      name: 'Architecture Reviewer',
      avatar: '🧭',
      description: 'Evaluates system design for scalability, reliability, and clarity.',
      skill: 'architecture-reviewer',
    },
    {
      id: 'persona-security-reviewer',
      name: 'Security Reviewer',
      avatar: '🛡️',
      description: 'Assesses security risks, controls, and compliance concerns.',
      skill: 'security-reviewer',
    },
    {
      id: 'persona-gateway',
      name: 'Gateway',
      avatar: '🔀',
      description: 'Routes flow based on pass/fail outcomes.',
      skill: 'gateway',
    },
    {
      id: 'persona-start',
      name: 'Start',
      avatar: '🟢',
      description: 'Workflow entry point.',
      skill: 'start',
    },
    {
      id: 'persona-end',
      name: 'End',
      avatar: '🏁',
      description: 'Workflow completion point.',
      skill: 'end',
    },
  ];

  for (const persona of defaultPersonas) {
    sqlite
      .prepare(
        `INSERT INTO personas (id, name, avatar, description, skill)
         VALUES (?, ?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET
           name = excluded.name,
           avatar = excluded.avatar,
           description = excluded.description,
           skill = excluded.skill`
      )
      .run(persona.id, persona.name, persona.avatar, persona.description, persona.skill);
  }
}

export * from './schema';
export default db;
