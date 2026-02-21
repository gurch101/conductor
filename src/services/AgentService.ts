import { AgentRepository } from '@/repositories/AgentRepository';
import { Agent } from '@/types';

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
      status: agent.status || 'working',
      tokensUsed: agent.tokensUsed || 0,
      input_schema: agent.input_schema || [],
      output_schema: agent.output_schema || [],
    });
  }
}
