import { serve } from 'bun';
import index from './index.html';
import { initDb } from './db/schema';
import { TeamService } from './services/TeamService';
import { PersonaService } from './services/PersonaService';
import { AgentService } from './services/AgentService';
import { ConnectionService } from './services/ConnectionService';
import { Agent } from './types';

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
        return Response.json(TeamService.getAllTeams());
      }
      if (req.method === 'POST') {
        const { name, objective } = (await req.json()) as { name: string; objective: string };
        const team = TeamService.createTeam(name, objective);
        return Response.json(team);
      }
    }

    const teamIdMatch = url.pathname.match(/^\/api\/teams\/([^/]+)$/);
    if (teamIdMatch && req.method === 'GET') {
      const team = TeamService.getTeamById(teamIdMatch[1]);
      if (!team) return new Response('Not Found', { status: 404 });
      return Response.json(team);
    }

    // Personas API
    if (url.pathname === '/api/personas' && req.method === 'GET') {
      return Response.json(PersonaService.getAllPersonas());
    }

    // Agents API
    if (url.pathname === '/api/agents' && req.method === 'POST') {
      const agent = (await req.json()) as Agent;
      AgentService.createAgent(agent);
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
      ConnectionService.createConnection(conn);
      return Response.json({ success: true });
    }

    return new Response('Not Found', { status: 404 });
  },
});

if (process.env.NODE_ENV !== 'test') {
  console.log(`🚀 Server running at ${server.url}`);
}
