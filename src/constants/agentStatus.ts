export const AgentStatus = {
  Done: 'done',
  Working: 'working',
  Ready: 'ready',
  WaitingForFeedback: 'waiting_for_feedback',
} as const;

export type AgentStatusValue = (typeof AgentStatus)[keyof typeof AgentStatus];
