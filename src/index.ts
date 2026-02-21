import { serve } from 'bun';
import { initDb } from './db';
import { TeamService } from './services/TeamService';
import { PersonaService } from './services/PersonaService';
import { AgentService } from './services/AgentService';
import { ConnectionService } from './services/ConnectionService';
import { TeamStreamService } from './services/TeamStreamService';
import type { Agent } from './types';
import index from './index.html';

const isTestEnv = process.env.NODE_ENV === 'test' || !!process.env.BUN_TEST;

// Initialize the database on startup (only if not testing)
if (!isTestEnv) {
  initDb();
}

const encoder = new TextEncoder();

const writeNdjson = (
  controller: ReadableStreamDefaultController<Uint8Array>,
  data: unknown
): void => {
  controller.enqueue(encoder.encode(`${JSON.stringify(data)}\n`));
};

const publishTeamSnapshotById = (teamId: string): void => {
  const team = TeamService.getTeamById(teamId);
  if (!team) return;
  TeamStreamService.publishTeamSnapshot(team);
};

export const appOptions = {
  routes: {
    // API Routes
    '/api/teams': {
      GET: () => Response.json(TeamService.getAllTeams()),
      POST: async (req: Request) => {
        try {
          const { name, objective } = (await req.json()) as { name: string; objective: string };
          const team = TeamService.createTeam(name, objective);
          TeamStreamService.publishTeamSnapshot(team);
          return Response.json(team);
        } catch (error) {
          return new Response(JSON.stringify({ error: (error as Error).message }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          });
        }
      },
    },

    '/api/teams/:id': {
      GET: (req) => {
        const team = TeamService.getTeamById(req.params.id);
        if (!team) return new Response('Not Found', { status: 404 });
        return Response.json(team);
      },
      PUT: async (req: Request) => {
        try {
          const id = req.params.id;
          const { name, objective, agents, connections } = (await req.json()) as {
            name: string;
            objective: string;
            agents?: Agent[];
            connections?: {
              source: string;
              source_handle?: string;
              target: string;
              target_handle?: string;
            }[];
          };
          TeamService.updateTeam(id, name, objective, agents, connections);
          publishTeamSnapshotById(id);
          return Response.json({ success: true });
        } catch (error) {
          return new Response(JSON.stringify({ error: (error as Error).message }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          });
        }
      },
      DELETE: (req) => {
        try {
          const id = req.params.id;
          TeamService.deleteTeam(id);
          return Response.json({ success: true });
        } catch (error) {
          return new Response(JSON.stringify({ error: (error as Error).message }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          });
        }
      },
    },

    '/api/teams/:id/stream': {
      GET: (req: Request) => {
        const teamId = req.params.id;
        const team = TeamService.getTeamById(teamId);
        if (!team) return new Response('Not Found', { status: 404 });

        let closeStream = () => {};

        const stream = new ReadableStream<Uint8Array>({
          start(controller) {
            let closed = false;
            let unsubscribe = () => {};
            closeStream = () => {
              if (closed) return;
              closed = true;
              clearInterval(heartbeat);
              unsubscribe();
              try {
                controller.close();
              } catch {
                // stream already closed
              }
            };

            const heartbeat = setInterval(() => {
              writeNdjson(controller, {
                type: 'heartbeat',
                ts: new Date().toISOString(),
              });
            }, 15000);

            unsubscribe = TeamStreamService.subscribe(teamId, (event) => {
              writeNdjson(controller, event);
            });

            req.signal.addEventListener('abort', closeStream);

            writeNdjson(controller, {
              type: 'stream_open',
              teamId,
              ts: new Date().toISOString(),
            });
            writeNdjson(controller, {
              type: 'team_snapshot',
              team,
              ts: new Date().toISOString(),
            });
          },
          cancel() {
            closeStream();
          },
        });

        return new Response(stream, {
          headers: {
            'Content-Type': 'application/x-ndjson; charset=utf-8',
            'Cache-Control': 'no-cache, no-transform',
            Connection: 'keep-alive',
          },
        });
      },
    },

    '/api/teams/:id/start': {
      POST: (req) => {
        try {
          const team = TeamService.startTeam(req.params.id);
          TeamStreamService.publishTeamSnapshot(team);
          for (const agent of team.agents) {
            TeamStreamService.publishAgentStatus(team.id, agent.id, agent.status);
          }
          return Response.json(team);
        } catch (error) {
          return new Response(JSON.stringify({ error: (error as Error).message }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          });
        }
      },
    },

    '/api/teams/:id/respond': {
      POST: async (req: Request) => {
        try {
          const { agentId, message } = (await req.json()) as { agentId: string; message: string };
          const team = TeamService.respondToAgent(req.params.id, agentId, message);
          TeamStreamService.publishChatMessage(team.id, agentId, 'user', message);
          const agent = team.agents.find((a) => a.id === agentId);
          if (agent) {
            TeamStreamService.publishAgentStatus(team.id, agentId, agent.status);
          }
          TeamStreamService.publishTeamSnapshot(team);
          return Response.json(team);
        } catch (error) {
          return new Response(JSON.stringify({ error: (error as Error).message }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          });
        }
      },
    },

    '/api/personas': {
      GET: () => Response.json(PersonaService.getAllPersonas()),
    },

    '/api/personas/:id': {
      DELETE: (req) => {
        try {
          const id = req.params.id;
          PersonaService.deletePersona(id);
          return Response.json({ success: true });
        } catch (error) {
          return new Response(JSON.stringify({ error: (error as Error).message }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          });
        }
      },
    },

    '/api/agents': {
      POST: async (req: Request) => {
        const agent = (await req.json()) as Agent;
        AgentService.createAgent(agent);
        publishTeamSnapshotById(agent.team_id);
        return Response.json({ success: true });
      },
    },

    '/api/agents/:id': {
      PUT: async (req: Request) => {
        const id = req.params.id;
        const { pos_x, pos_y } = (await req.json()) as { pos_x: number; pos_y: number };
        AgentService.updateAgentPosition(id, pos_x, pos_y);
        const teamId = AgentService.getAgentTeamId(id);
        if (teamId) {
          publishTeamSnapshotById(teamId);
        }
        return Response.json({ success: true });
      },
      DELETE: (req) => {
        const id = req.params.id;
        const teamId = AgentService.getAgentTeamId(id);
        AgentService.deleteAgent(id);
        if (teamId) {
          publishTeamSnapshotById(teamId);
        }
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
        publishTeamSnapshotById(conn.team_id);
        return Response.json({ success: true });
      },
      DELETE: async (req: Request) => {
        const conn = (await req.json()) as {
          team_id: string;
          source_id: string;
          source_handle: string | null;
          target_id: string;
          target_handle: string | null;
        };
        ConnectionService.deleteConnection(conn);
        publishTeamSnapshotById(conn.team_id);
        return Response.json({ success: true });
      },
    },

    // Catch-all for unknown API routes to return 404 instead of index.html
    '/api/*': () => new Response('Not Found', { status: 404 }),

    // Default: return the index page for SPA
    // Bun 1.2+ 'HTMLBundle' automatically handles scripts/assets in index.html
    '/*': index,
  },

  development: !isTestEnv &&
    process.env.NODE_ENV !== 'production' && {
      hmr: true,
      console: true,
    },
};

export const server = !isTestEnv ? serve(appOptions) : null;

if (!isTestEnv && server) {
  console.log(`🚀 Server running at ${server.url}`);
}
