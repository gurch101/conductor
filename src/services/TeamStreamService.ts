import type { Team } from '@/types';
import type { AgentStatusValue } from '@/constants/agentStatus';

type StreamEvent =
  | {
      type: 'team_snapshot';
      team: Team;
      ts: string;
    }
  | {
      type: 'chat_message';
      teamId: string;
      agentId: string;
      role: 'user' | 'agent';
      message: string;
      ts: string;
    }
  | {
      type: 'agent_status';
      teamId: string;
      agentId: string;
      status: AgentStatusValue;
      ts: string;
    }
  | {
      type: 'heartbeat';
      ts: string;
    };

type Subscriber = (event: StreamEvent) => void;

/**
 * In-memory pub/sub service for team orchestration stream updates.
 * This provides NDJSON events to connected clients.
 */
export class TeamStreamService {
  private static subscribersByTeam = new Map<string, Set<Subscriber>>();

  /**
   * Subscribes a callback to events for a team.
   * @param teamId Team identifier.
   * @param subscriber Event callback.
   * @returns Cleanup function to unsubscribe.
   */
  static subscribe(teamId: string, subscriber: Subscriber): () => void {
    const current = this.subscribersByTeam.get(teamId) || new Set<Subscriber>();
    current.add(subscriber);
    this.subscribersByTeam.set(teamId, current);

    return () => {
      const next = this.subscribersByTeam.get(teamId);
      if (!next) return;
      next.delete(subscriber);
      if (next.size === 0) {
        this.subscribersByTeam.delete(teamId);
      }
    };
  }

  /**
   * Publishes a raw event to all subscribers of a team.
   * @param teamId Team identifier.
   * @param event Stream event payload.
   */
  static publish(teamId: string, event: StreamEvent): void {
    const subscribers = this.subscribersByTeam.get(teamId);
    if (!subscribers || subscribers.size === 0) return;

    for (const subscriber of subscribers) {
      subscriber(event);
    }
  }

  /**
   * Publishes a full team snapshot update.
   * @param team Full team payload.
   */
  static publishTeamSnapshot(team: Team): void {
    this.publish(team.id, {
      type: 'team_snapshot',
      team,
      ts: new Date().toISOString(),
    });
  }

  /**
   * Publishes an agent status transition event.
   * @param teamId Team identifier.
   * @param agentId Agent identifier.
   * @param status New agent status.
   */
  static publishAgentStatus(
    teamId: string,
    agentId: string,
    status: AgentStatusValue
  ): void {
    this.publish(teamId, {
      type: 'agent_status',
      teamId,
      agentId,
      status,
      ts: new Date().toISOString(),
    });
  }

  /**
   * Publishes a chat message event.
   * @param teamId Team identifier.
   * @param agentId Agent identifier.
   * @param role Sender role.
   * @param message Message text.
   */
  static publishChatMessage(
    teamId: string,
    agentId: string,
    role: 'user' | 'agent',
    message: string
  ): void {
    this.publish(teamId, {
      type: 'chat_message',
      teamId,
      agentId,
      role,
      message,
      ts: new Date().toISOString(),
    });
  }

  /**
   * Returns whether the team currently has one or more active stream subscribers.
   * @param teamId Team identifier.
   * @returns True when at least one client is actively subscribed.
   */
  static hasActiveSubscribers(teamId: string): boolean {
    return (this.subscribersByTeam.get(teamId)?.size || 0) > 0;
  }
}
