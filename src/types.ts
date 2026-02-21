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
