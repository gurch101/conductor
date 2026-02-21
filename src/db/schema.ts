import { sqliteTable, text, real, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const teams = sqliteTable('teams', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  objective: text('objective'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

export const personas = sqliteTable('personas', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  avatar: text('avatar'),
  systemPrompt: text('system_prompt').notNull(),
  inputSchema: text('input_schema').default('[]'),
  outputSchema: text('output_schema').default('[]'),
});

export const agents = sqliteTable('agents', {
  id: text('id').primaryKey(),
  teamId: text('team_id')
    .notNull()
    .references(() => teams.id, { onDelete: 'cascade' }),
  role: text('role').notNull(),
  status: text('status', { enum: ['done', 'working', 'waiting_approval'] }).default('working'),
  summary: text('summary'),
  tokensUsed: integer('tokens_used').default(0),
  inputSchema: text('input_schema'),
  outputSchema: text('output_schema'),
  posX: real('pos_x').default(0),
  posY: real('pos_y').default(0),
});

export const connections = sqliteTable('connections', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  teamId: text('team_id')
    .notNull()
    .references(() => teams.id, { onDelete: 'cascade' }),
  sourceId: text('source_id')
    .notNull()
    .references(() => agents.id, { onDelete: 'cascade' }),
  sourceHandle: text('source_handle'),
  targetId: text('target_id')
    .notNull()
    .references(() => agents.id, { onDelete: 'cascade' }),
  targetHandle: text('target_handle'),
});

export const logs = sqliteTable('logs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  agentId: text('agent_id')
    .notNull()
    .references(() => agents.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  timestamp: text('timestamp').default(sql`CURRENT_TIMESTAMP`),
});
