import db from '@/db/schema';
import { DBAgent, Agent } from '@/types';

export class AgentRepository {
  static findByTeamId(teamId: string): DBAgent[] {
    return db.prepare('SELECT * FROM agents WHERE team_id = ?').all(teamId) as DBAgent[];
  }

  static findLogsByAgentId(agentId: string): string[] {
    const logs = db
      .prepare('SELECT content FROM logs WHERE agent_id = ? ORDER BY timestamp ASC')
      .all(agentId) as { content: string }[];
    return logs.map((l) => l.content);
  }

  static create(agent: Agent): void {
    db.prepare(
      `
      INSERT INTO agents (id, team_id, role, status, summary, tokens_used, input_schema, output_schema, pos_x, pos_y)
      VALUES ($id, $team_id, $role, $status, $summary, $tokens_used, $input_schema, $output_schema, $pos_x, $pos_y)
    `
    ).run({
      $id: agent.id,
      $team_id: agent.team_id,
      $role: agent.role,
      $status: agent.status,
      $summary: agent.summary || '',
      $tokens_used: agent.tokensUsed || 0,
      $input_schema: JSON.stringify(agent.input_schema || []),
      $output_schema: JSON.stringify(agent.output_schema || []),
      $pos_x: agent.pos_x || 0,
      $pos_y: agent.pos_y || 0,
    });
  }
}
