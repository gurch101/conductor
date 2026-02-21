import { serve } from 'bun';
import { initDb } from './db/schema';
import { TeamService } from './services/TeamService';
import { PersonaService } from './services/PersonaService';
import { AgentService } from './services/AgentService';
import { ConnectionService } from './services/ConnectionService';
import type { Agent } from './types';
import index from './index.html';

// Initialize the database on startup (only if not testing)
if (process.env.NODE_ENV !== 'test') {
  initDb();
}

export const appOptions = {
  routes: {
    // API Routes
    '/api/teams': {
      GET: () => Response.json(TeamService.getAllTeams()),
      POST: async (req: Request) => {
        const { name, objective } = (await req.json()) as { name: string; objective: string };
        const team = TeamService.createTeam(name, objective);
        return Response.json(team);
      },
    },

    '/api/teams/:id': {
      GET: (req: any) => {
        const team = TeamService.getTeamById(req.params.id);
        if (!team) return new Response('Not Found', { status: 404 });
        return Response.json(team);
      },
    },

    '/api/personas': {
      GET: () => Response.json(PersonaService.getAllPersonas()),
    },

    '/api/agents': {
      POST: async (req: Request) => {
        const agent = (await req.json()) as Agent;
        AgentService.createAgent(agent);
        return Response.json({ success: true });
      },
    },

    '/api/connections': {
      POST: async (req: Request) => {
        const conn = (await req.json()) as {
          team_id: string;
          source_id: string;
          source_handle: string | null;
          target_id: string;
          target_handle: string | null;
        };
        ConnectionService.createConnection(conn);
        return Response.json({ success: true });
      },
    },

    // Catch-all for unknown API routes to return 404 instead of index.html
    '/api/*': () => new Response('Not Found', { status: 404 }),

    // Default: return the index page for SPA
    // Bun 1.2+ 'HTMLBundle' automatically handles scripts/assets in index.html
    '/*': index,
  },

  development: process.env.NODE_ENV !== 'production' && {
    hmr: true,
    console: true,
  },
};

export const server = serve(appOptions);

if (process.env.NODE_ENV !== 'test') {
  console.log(`🚀 Server running at ${server.url}`);
}
