import { serve } from 'bun';
import index from './index.html';
import db, { initDb } from './db/schema';
import { v4 as uuidv4 } from 'uuid';
import { DBAgent, DBTeam, DBConnection, DBPersona, Agent } from './types';

// Initialize the database on startup (only if not testing)
if (process.env.NODE_ENV !== 'test') {
  initDb();
}

export const server = serve({
  static: {
    '/*': index,
  },
  async fetch(req) {
    const url = new URL(req.url);

    // Teams API
    if (url.pathname === '/api/teams') {
      if (req.method === 'GET') {
        const teams = db.prepare('SELECT * FROM teams ORDER BY created_at DESC').all() as DBTeam[];
        // Hydrate teams with agents and connections
        const hydratedTeams = teams.map((team) => {
          const agents = db
            .prepare('SELECT * FROM agents WHERE team_id = ?')
            .all(team.id) as DBAgent[];
          const connections = db
            .prepare('SELECT * FROM connections WHERE team_id = ?')
            .all(team.id) as DBConnection[];

          // Get logs for each agent
          const agentsWithLogs: Agent[] = agents.map((agent) => {
            const logs = db
              .prepare('SELECT content FROM logs WHERE agent_id = ? ORDER BY timestamp ASC')
              .all(agent.id) as { content: string }[];
            return {
              ...agent,
              tokensUsed: agent.tokens_used,
              input_schema: JSON.parse(agent.input_schema || '[]'),
              output_schema: JSON.parse(agent.output_schema || '[]'),
              logs: logs.map((l) => l.content),
            };
          });

          const mappedConnections = connections.map((c) => ({
            source: c.source_id,
            source_handle: c.source_handle || undefined,
            target: c.target_id,
            target_handle: c.target_handle || undefined,
          }));

          return { ...team, agents: agentsWithLogs, connections: mappedConnections };
        });
        return Response.json(hydratedTeams);
      }
      if (req.method === 'POST') {
        const { name, objective } = (await req.json()) as { name: string; objective: string };
        const id = uuidv4();
        db.prepare('INSERT INTO teams (id, name, objective) VALUES (?, ?, ?)').run(
          id,
          name,
          objective
        );
        return Response.json({ id, name, objective, agents: [], connections: [] });
      }
    }

    const teamIdMatch = url.pathname.match(/^\/api\/teams\/([^/]+)$/);
    if (teamIdMatch && req.method === 'GET') {
      const id = teamIdMatch[1];
      const team = db.prepare('SELECT * FROM teams WHERE id = ?').get(id) as DBTeam;
      if (!team) return new Response('Not Found', { status: 404 });

      const agents = db.prepare('SELECT * FROM agents WHERE team_id = ?').all(team.id) as DBAgent[];
      const connections = db
        .prepare('SELECT * FROM connections WHERE team_id = ?')
        .all(team.id) as DBConnection[];

      const agentsWithLogs: Agent[] = agents.map((agent) => {
        const logs = db
          .prepare('SELECT content FROM logs WHERE agent_id = ? ORDER BY timestamp ASC')
          .all(agent.id) as { content: string }[];
        return {
          ...agent,
          tokensUsed: agent.tokens_used,
          input_schema: JSON.parse(agent.input_schema || '[]'),
          output_schema: JSON.parse(agent.output_schema || '[]'),
          logs: logs.map((l) => l.content),
        };
      });

      const mappedConnections = connections.map((c) => ({
        source: c.source_id,
        source_handle: c.source_handle || undefined,
        target: c.target_id,
        target_handle: c.target_handle || undefined,
      }));

      return Response.json({ ...team, agents: agentsWithLogs, connections: mappedConnections });
    }

    // Personas API
    if (url.pathname === '/api/personas' && req.method === 'GET') {
      const personas = db.prepare('SELECT * FROM personas').all() as DBPersona[];
      const parsed = personas.map((p) => ({
        ...p,
        systemPrompt: p.system_prompt,
        input_schema: JSON.parse(p.input_schema || '[]'),
        output_schema: JSON.parse(p.output_schema || '[]'),
      }));
      return Response.json(parsed);
    }

    // Agents API
    if (url.pathname === '/api/agents' && req.method === 'POST') {
      const agent = (await req.json()) as Agent;
      db.prepare(
        `
        INSERT INTO agents (id, team_id, role, status, summary, tokens_used, input_schema, output_schema, pos_x, pos_y)
        VALUES ($id, $team_id, $role, $status, $summary, $tokens_used, $input_schema, $output_schema, $pos_x, $pos_y)
      `
      ).run({
        $id: agent.id || uuidv4(),
        $team_id: agent.team_id,
        $role: agent.role,
        $status: agent.status || 'working',
        $summary: agent.summary || '',
        $tokens_used: agent.tokens_used || 0,
        $input_schema: JSON.stringify(agent.input_schema || []),
        $output_schema: JSON.stringify(agent.output_schema || []),
        $pos_x: agent.pos_x || 0,
        $pos_y: agent.pos_y || 0,
      });
      return Response.json({ success: true });
    }

    // Connections API
    if (url.pathname === '/api/connections' && req.method === 'POST') {
      const conn = (await req.json()) as {
        team_id: string;
        source_id: string;
        source_handle: string | null;
        target_id: string;
        target_handle: string | null;
      };
      db.prepare(
        `
         INSERT INTO connections (team_id, source_id, source_handle, target_id, target_handle)
         VALUES (?, ?, ?, ?, ?)
       `
      ).run(conn.team_id, conn.source_id, conn.source_handle, conn.target_id, conn.target_handle);
      return Response.json({ success: true });
    }

    return new Response('Not Found', { status: 404 });
  },

  development: process.env.NODE_ENV !== 'production' && {
    hmr: true,
    console: true,
  },
});

if (process.env.NODE_ENV !== 'test') {
  console.log(`🚀 Server running at ${server.url}`);
}
