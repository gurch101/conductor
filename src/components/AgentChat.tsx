import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Send, Terminal, ShieldAlert, CheckCircle2, XCircle } from 'lucide-react';
import type { Agent, Team } from '../types';

interface AgentChatProps {
  team: Team;
  agent: Agent;
  onBack: () => void;
  onApprove: (agentId: string) => void;
}

export const AgentChat: React.FC<AgentChatProps> = ({ team, agent, onBack, onApprove }) => {
  const [input, setInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [agent.logs]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    // In a real app, this would send a message to the agent
    setInput('');
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 overflow-hidden">
      {/* Header */}
      <div className="h-14 border-b border-slate-800 flex items-center justify-between px-6 bg-slate-900/50">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="text-slate-400 hover:text-white transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
            <h2 className="font-bold text-sm uppercase tracking-widest text-slate-200">
              Intervention: <span className="text-blue-500">{agent.description}</span>
            </h2>
          </div>
        </div>
        <div className="text-[10px] text-slate-500 font-mono hidden sm:block">
          TEAM: {team.name.toUpperCase()}
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left: Agent Status & Info */}
        <div className="w-80 border-r border-slate-800 bg-slate-900/10 p-6 space-y-6 hidden lg:block overflow-y-auto">
          <div>
            <label className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em] mb-2 block">
              Current Task
            </label>
            <p className="text-sm text-slate-300 leading-relaxed bg-slate-900/50 p-3 rounded-lg border border-slate-800">
              {agent.summary}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-yellow-500/5 border border-yellow-500/20">
            <div className="flex items-center gap-2 text-yellow-500 mb-2">
              <ShieldAlert size={16} />
              <span className="text-xs font-bold uppercase tracking-wider">Approval Required</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              The agent has flagged a potential issue or reached a decision point that requires
              human oversight before proceeding.
            </p>
          </div>

          <div className="space-y-2">
            <button
              onClick={() => onApprove(agent.id)}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-green-600 hover:bg-green-500 text-white text-sm font-bold transition-all shadow-lg shadow-green-900/20"
            >
              <CheckCircle2 size={16} /> Approve Execution
            </button>
            <button className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 text-sm font-bold transition-all border border-slate-700">
              <XCircle size={16} /> Reject & Terminate
            </button>
          </div>
        </div>

        {/* Right: Interaction Log */}
        <div className="flex-1 flex flex-col bg-slate-950">
          <div className="flex-1 overflow-y-auto p-6 space-y-4 font-mono">
            <div className="text-[10px] text-slate-600 text-center uppercase tracking-widest mb-8">
              — Agent Execution Log —
            </div>

            {agent.logs.map((log, i) => (
              <div key={i} className="flex gap-4 group">
                <span className="text-slate-700 text-[10px] whitespace-nowrap pt-1">
                  [
                  {new Date().toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  })}
                  ]
                </span>
                <div className="flex-1 text-[12px] text-slate-400 group-last:text-blue-400 transition-colors">
                  <span className="text-slate-600 mr-2">$</span>
                  {log}
                </div>
              </div>
            ))}

            <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-500/80 text-[11px] italic">
              Wait: Awaiting human feedback to clarify "Security Auditor" findings...
            </div>

            <div ref={chatEndRef} />
          </div>

          {/* Chat Input */}
          <div className="p-6 border-t border-slate-800 bg-slate-900/20">
            <form onSubmit={handleSend} className="relative max-w-4xl mx-auto">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600">
                <Terminal size={16} />
              </div>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Clarify goals or provide manual override commands..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 pl-12 pr-12 text-sm text-white focus:outline-none focus:border-blue-500 transition-all shadow-inner placeholder:text-slate-600"
              />
              <button
                type="submit"
                disabled={!input.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-blue-500 hover:text-white disabled:text-slate-700 transition-colors"
              >
                <Send size={18} />
              </button>
            </form>
            <div className="text-center mt-3">
              <span className="text-[9px] text-slate-600 uppercase tracking-widest font-bold">
                Direct Neural Override Protocol v2.4
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
