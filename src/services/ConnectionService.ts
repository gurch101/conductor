import { ConnectionRepository } from '@/repositories/ConnectionRepository';

/**
 * Service for managing agent connections.
 */
export class ConnectionService {
  /**
   * Creates a new connection between agents.
   * @param data The connection data.
   * @param data.team_id The ID of the team.
   * @param data.source_id The ID of the source agent.
   * @param data.source_handle The handle of the source agent's output.
   * @param data.target_id The ID of the target agent.
   * @param data.target_handle The handle of the target agent's input.
   */
  static createConnection(data: {
    team_id: string;
    source_id: string;
    source_handle: string | null;
    target_id: string;
    target_handle: string | null;
  }): void {
    ConnectionRepository.create(data);
  }

  /**
   * Deletes a connection between agents.
   * @param data The connection data.
   * @param data.team_id The ID of the team.
   * @param data.source_id The ID of the source agent.
   * @param data.source_handle The handle of the source agent's output.
   * @param data.target_id The ID of the target agent.
   * @param data.target_handle The handle of the target agent's input.
   */
  static deleteConnection(data: {
    team_id: string;
    source_id: string;
    source_handle: string | null;
    target_id: string;
    target_handle: string | null;
  }): void {
    ConnectionRepository.delete(data);
  }
}
