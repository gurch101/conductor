import { AgentRepository } from '@/repositories/AgentRepository';
import { AgentStatus } from '@/constants/agentStatus';
import type { Agent } from '@/types';

/**
 * Service for managing agents.
 */
export class AgentService {
  /**
   * Creates a new agent, generating a UUID if not provided.
   * @param agent The agent object to create.
   */
  static createAgent(agent: Agent): void {
    const id = agent.id || crypto.randomUUID();
    AgentRepository.create({
      ...agent,
      id,
      status: agent.status || AgentStatus.Ready,
      tokensUsed: agent.tokensUsed || 0,
      input_schema: agent.input_schema || [],
      output_schema: agent.output_schema || [],
    });
  }

  /**
   * Deletes an agent by ID.
   * @param id The ID of the agent to delete.
   */
  static deleteAgent(id: string): void {
    AgentRepository.delete(id);
  }

  /**
   * Updates an agent's canvas position.
   * @param id The ID of the agent.
   * @param posX The X position on the canvas.
   * @param posY The Y position on the canvas.
   */
  static updateAgentPosition(id: string, posX: number, posY: number): void {
    AgentRepository.updatePosition(id, posX, posY);
  }

  /**
   * Resolves the team ID for a given agent.
   * @param id The agent ID.
   * @returns The owning team ID or null if not found.
   */
  static getAgentTeamId(id: string): string | null {
    return AgentRepository.findById(id)?.teamId || null;
  }
}
