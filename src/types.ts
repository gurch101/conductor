export interface DBAgent {
  id: string;
  team_id: string;
  role: string;
  status: 'done' | 'working' | 'waiting_approval';
  summary: string;
  tokens_used: number;
  input_schema: string;
  output_schema: string;
  pos_x: number;
  pos_y: number;
}

export interface DBTeam {
  id: string;
  name: string;
  objective: string;
  created_at: string;
}

export interface DBConnection {
  id: number;
  team_id: string;
  source_id: string;
  source_handle: string | null;
  target_id: string;
  target_handle: string | null;
}

export interface DBPersona {
  id: string;
  name: string;
  avatar: string;
  system_prompt: string;
  input_schema: string;
  output_schema: string;
}

export interface Agent {
  id: string;
  team_id: string;
  role: string;
  status: 'done' | 'working' | 'waiting_approval';
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
  systemPrompt: string;
  input_schema: { name: string; type: string }[];
  output_schema: { name: string; type: string }[];
};
