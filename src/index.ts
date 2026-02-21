import { serve } from "bun";
import index from "./index.html";
import db, { initDb } from "./db/schema";
import { v4 as uuidv4 } from 'uuid';

// Initialize the database on startup
initDb();

const server = serve({
  routes: {
    "/*": index,

    // Teams API
    "/api/teams": {
      async GET() {
        const teams = db.prepare("SELECT * FROM teams ORDER BY created_at DESC").all();
        // Hydrate teams with agents and connections
        const hydratedTeams = teams.map((team: any) => {
          const agents = db.prepare("SELECT * FROM agents WHERE team_id = ?").all(team.id);
          const connections = db.prepare("SELECT * FROM connections WHERE team_id = ?").all(team.id);
          
          // Get logs for each agent
          const agentsWithLogs = agents.map((agent: any) => {
             const logs = db.prepare("SELECT content FROM logs WHERE agent_id = ? ORDER BY timestamp ASC").all(agent.id);
             return {
               ...agent,
               tokensUsed: agent.tokens_used,
               input_schema: JSON.parse(agent.input_schema || '[]'),
               output_schema: JSON.parse(agent.output_schema || '[]'),
               logs: logs.map((l: any) => l.content)
             };
          });

          return { ...team, agents: agentsWithLogs, connections };
        });
        return Response.json(hydratedTeams);
      },
      async POST(req) {
        const { name, objective } = await req.json() as any;
        const id = uuidv4();
        db.prepare("INSERT INTO teams (id, name, objective) VALUES (?, ?, ?)").run(id, name, objective);
        return Response.json({ id, name, objective, agents: [], connections: [] });
      }
    },

    "/api/teams/:id": {
       async GET(req) {
          const team = db.prepare("SELECT * FROM teams WHERE id = ?").get(req.params.id) as any;
          if (!team) return new Response("Not Found", { status: 404 });
          
          const agents = db.prepare("SELECT * FROM agents WHERE team_id = ?").all(team.id);
          const connections = db.prepare("SELECT * FROM connections WHERE team_id = ?").all(team.id);
          
          const agentsWithLogs = agents.map((agent: any) => {
             const logs = db.prepare("SELECT content FROM logs WHERE agent_id = ? ORDER BY timestamp ASC").all(agent.id);
             return {
               ...agent,
               tokensUsed: agent.tokens_used,
               input_schema: JSON.parse(agent.input_schema || '[]'),
               output_schema: JSON.parse(agent.output_schema || '[]'),
               logs: logs.map((l: any) => l.content)
             };
          });

          return Response.json({ ...team, agents: agentsWithLogs, connections });
       }
    },

    // Personas API
    "/api/personas": {
       async GET() {
         const personas = db.prepare("SELECT * FROM personas").all() as any[];
         const parsed = personas.map(p => ({
           ...p,
           input_schema: JSON.parse(p.input_schema || '[]'),
           output_schema: JSON.parse(p.output_schema || '[]')
         }));
         return Response.json(parsed);
       }
    },

    // Agents API
    "/api/agents": {
      async POST(req) {
        const agent = await req.json() as any;
        db.prepare(`
          INSERT INTO agents (id, team_id, role, status, summary, tokens_used, input_schema, output_schema, pos_x, pos_y)
          VALUES ($id, $team_id, $role, $status, $summary, $tokens_used, $input_schema, $output_schema, $pos_x, $pos_y)
        `).run({
          $id: agent.id || uuidv4(),
          $team_id: agent.team_id,
          $role: agent.role,
          $status: agent.status || 'working',
          $summary: agent.summary || '',
          $tokens_used: agent.tokens_used || 0,
          $input_schema: JSON.stringify(agent.input_schema || []),
          $output_schema: JSON.stringify(agent.output_schema || []),
          $pos_x: agent.pos_x || 0,
          $pos_y: agent.pos_y || 0
        });
        return Response.json({ success: true });
      }
    },

    // Connections API
    "/api/connections": {
       async POST(req) {
         const conn = await req.json() as any;
         db.prepare(`
           INSERT INTO connections (team_id, source_id, source_handle, target_id, target_handle)
           VALUES (?, ?, ?, ?, ?)
         `).run(conn.team_id, conn.source_id, conn.source_handle, conn.target_id, conn.target_handle);
         return Response.json({ success: true });
       }
    }
  },

  development: process.env.NODE_ENV !== "production" && {
    hmr: true,
    console: true,
  },
});

console.log(`🚀 Server running at ${server.url}`);
