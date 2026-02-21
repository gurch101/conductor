import { ConnectionRepository } from '@/repositories/ConnectionRepository';

export class ConnectionService {
  static createConnection(data: {
    team_id: string;
    source_id: string;
    source_handle: string | null;
    target_id: string;
    target_handle: string | null;
  }): void {
    ConnectionRepository.create(data);
  }
}
