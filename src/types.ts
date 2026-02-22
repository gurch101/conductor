import type { AgentStatusValue } from './constants/agentStatus';

export interface DBAgent {
  id: string;
  teamId: string;
  personaId: string | null;
  status: AgentStatusValue;
  summary: string | null;
  tokensUsed: number | null;
  inputSchema: string | null;
  outputSchema: string | null;
  posX: number | null;
  posY: number | null;
}

export interface DBTeam {
  id: string;
  name: string;
  objective: string | null;
  createdAt: string | null;
}

export interface DBConnection {
  id: number;
  teamId: string;
  sourceId: string;
  sourceHandle: string | null;
  targetId: string;
  targetHandle: string | null;
}

export interface DBPersona {
  id: string;
  name: string;
  avatar: string | null;
  description: string | null;
  skill: string;
}

export interface Agent {
  id: string;
  team_id: string;
  persona_id?: string;
  persona_name?: string;
  description: string;
  status: AgentStatusValue;
  summary: string;
  tokensUsed: number;
  input_schema: { name: string; type: string }[];
  output_schema: { name: string; type: string }[];
  logs: string[];
  pos_x?: number;
  pos_y?: number;
}

export interface Team {
  id: string;
  name: string;
  objective: string;
  agents: Agent[];
  connections: {
    source: string;
    source_handle?: string;
    target: string;
    target_handle?: string;
  }[];
}

export type Persona = {
  id: string;
  name: string;
  avatar: string;
  description: string;
  skill: string;
};
