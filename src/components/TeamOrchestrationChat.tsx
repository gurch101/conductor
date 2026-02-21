import React, { useMemo, useState, useEffect, useRef } from 'react';
import { ArrowLeft, Send, ShieldAlert, Circle, CheckCircle2, Loader2, Bot } from 'lucide-react';
import type { Team } from '../types';
import { AgentStatus } from '@/constants/agentStatus';

interface TeamOrchestrationChatProps {
  team: Team;
  onBack: () => void;
  onRespond: (agentId: string, message: string) => Promise<void>;
}

export const TeamOrchestrationChat: React.FC<TeamOrchestrationChatProps> = ({
  team,
  onBack,
  onRespond,
}) => {
  const [response, setResponse] = useState('');
  const [focusedAgentId, setFocusedAgentId] = useState<string>('');
  const [isSending, setIsSending] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const workingAgent = useMemo(
    () => team.agents.find((a) => a.status === AgentStatus.Working) || null,
    [team]
  );
  const waitingAgents = useMemo(
    () => team.agents.filter((a) => a.status === AgentStatus.WaitingForFeedback),
    [team]
  );
  const focusedAgent = useMemo(
    () => team.agents.find((a) => a.id === focusedAgentId) || null,
    [team.agents, focusedAgentId]
  );

  useEffect(() => {
    const focusedStillExists = team.agents.some((a) => a.id === focusedAgentId);
    if (!focusedStillExists) {
      setFocusedAgentId(waitingAgents[0]?.id || workingAgent?.id || team.agents[0]?.id || '');
    }
  }, [waitingAgents, workingAgent, team.agents, focusedAgentId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [team]);

  const focusedTimeline = useMemo(() => {
    if (!focusedAgent) return [];

    return focusedAgent.logs.map((message, idx) => ({
      id: `${focusedAgent.id}-${idx}`,
      agentName: focusedAgent.persona_name || focusedAgent.description,
      status: focusedAgent.status,
      message,
    }));
  }, [focusedAgent]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!response.trim() || !focusedAgentId || isSending) return;

    setIsSending(true);
    try {
      await onRespond(focusedAgentId, response.trim());
      setResponse('');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 overflow-hidden">
      <div className="h-14 border-b border-slate-800 flex items-center justify-between px-6 bg-slate-900/50">
        <div className="flex items-center gap-4 min-w-0">
          <button onClick={onBack} className="text-slate-400 hover:text-white transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-slate-100 truncate">{team.name}</h2>
            <p className="text-[11px] text-slate-500 truncate">
              {team.objective || 'No objective set'}
            </p>
          </div>
        </div>
        <div className="text-xs text-slate-400 hidden sm:flex items-center gap-2">
          <Bot size={14} />
          {workingAgent
            ? `Working: ${workingAgent.persona_name || workingAgent.description}`
            : 'Idle'}
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <aside className="w-80 border-r border-slate-800 bg-slate-900/20 p-4 overflow-y-auto hidden lg:block">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Agents</h3>
          <div className="space-y-2">
            {team.agents.map((agent) => {
              const label =
                agent.status === AgentStatus.Done
                  ? 'Done'
                  : agent.status === AgentStatus.WaitingForFeedback
                    ? 'Action Needed'
                    : agent.status === AgentStatus.Working
                      ? 'Working'
                      : 'Ready';
              return (
                <div
                  key={agent.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    focusedAgentId === agent.id
                      ? 'border-blue-500/60 bg-blue-500/10'
                      : 'border-slate-800 bg-slate-900/40 hover:border-slate-700'
                  }`}
                  onClick={() => setFocusedAgentId(agent.id)}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm text-slate-200 truncate">
                      {agent.persona_name || agent.description}
                    </p>
                    <span className="text-[10px] text-slate-500">{label}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{agent.summary}</p>
                </div>
              );
            })}
          </div>

          <div className="mt-6 p-3 rounded-lg border border-yellow-600/30 bg-yellow-500/10">
            <div className="flex items-center gap-2 text-yellow-400 text-xs font-semibold mb-1">
              <ShieldAlert size={14} /> Pending Requests
            </div>
            <p className="text-xs text-slate-300">
              {waitingAgents.length} agent(s) waiting for your input.
            </p>
          </div>
        </aside>

        <section className="flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto p-5 font-mono space-y-3">
            {focusedTimeline.length === 0 && (
              <div className="text-xs text-slate-500">
                {focusedAgent
                  ? 'No activity yet for this agent.'
                  : 'No activity yet. Start the team to begin orchestration.'}
              </div>
            )}
            {focusedTimeline.map((event) => {
              const StatusIcon =
                event.status === AgentStatus.Done
                  ? CheckCircle2
                  : event.status === AgentStatus.WaitingForFeedback
                    ? ShieldAlert
                    : Circle;
              const statusClass =
                event.status === AgentStatus.Done
                  ? 'text-green-400'
                  : event.status === AgentStatus.WaitingForFeedback
                    ? 'text-yellow-400'
                    : event.status === AgentStatus.Working
                      ? 'text-blue-400'
                      : 'text-cyan-400';

              return (
                <div
                  key={event.id}
                  className="rounded-lg border border-slate-800 bg-slate-900/40 p-3"
                >
                  <div className="text-[10px] text-slate-500 mb-2 flex items-center justify-between">
                    <span>{event.agentName}</span>
                    <span className={`inline-flex items-center gap-1 ${statusClass}`}>
                      <StatusIcon size={11} />
                      {event.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">{event.message}</p>
                </div>
              );
            })}
            <div ref={chatEndRef} />
          </div>

          <div className="border-t border-slate-800 p-4 bg-slate-900/30">
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="text-[11px] text-slate-500">
                Focused agent:{' '}
                <span className="text-slate-300">
                  {focusedAgent
                    ? focusedAgent.persona_name || focusedAgent.description
                    : 'Select an agent from the left panel'}
                </span>
              </div>

              <div className="relative">
                <input
                  type="text"
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  placeholder="Reply with clarifications, decisions, or access approvals..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 pl-3 pr-10 text-sm text-white focus:outline-none focus:border-blue-500"
                />
                <button
                  type="submit"
                  disabled={!response.trim() || !focusedAgentId || isSending}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-400 disabled:text-slate-700"
                >
                  {isSending ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
                </button>
              </div>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
};
