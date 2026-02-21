import React, { useState } from 'react';
import { Handle, Position, useReactFlow } from 'reactflow';
import type { Agent } from '../types';
import { Coins, Terminal, Pause, Play, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';

interface AgentNodeProps {
  data: Agent;
}

export const AgentNode: React.FC<AgentNodeProps> = React.memo(({ data }) => {
  const [showLogs, setShowLogs] = useState(false);
  const { deleteElements } = useReactFlow();
  const cost = ((data.tokensUsed / 1000) * 0.02).toFixed(3);

  const statusColors = {
    done: 'bg-green-500',
    working: 'bg-blue-500',
    waiting_approval: 'bg-yellow-500',
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg shadow-2xl w-[220px] text-slate-200 overflow-hidden group/node">
      <Handle
        type="target"
        position={Position.Top}
        className="w-2 h-2 bg-slate-700 border-2 border-slate-900"
      />
      <Handle
        type="target"
        id="left-target"
        position={Position.Left}
        className="w-2 h-2 bg-slate-700 border-2 border-slate-900"
      />

      {/* Header */}
      <div className="p-2 border-b border-slate-800 bg-slate-900/50 flex justify-between items-center relative">
        <div className="flex items-center gap-1.5 min-w-0">
          <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${statusColors[data.status]}`} />
          <span className="font-bold text-[10px] tracking-tight uppercase truncate">
            {data.persona_name || data.description}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800 text-[9px] text-slate-400 shrink-0">
            <Coins size={8} className="text-yellow-500" />${cost}
          </div>
          <button
            onClick={() => deleteElements({ nodes: [{ id: data.id }] })}
            className="opacity-0 group-hover/node:opacity-100 p-1 hover:bg-red-500/20 hover:text-red-500 rounded transition-all"
            title="Delete Agent"
          >
            <Trash2 size={10} />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="p-2">
        <p className="text-[10px] text-slate-400 leading-tight mb-2 line-clamp-2">{data.summary}</p>

        <div className="flex gap-1.5">
          <button className="flex-1 flex items-center justify-center gap-1 py-1 px-1 rounded bg-slate-800 hover:bg-slate-750 text-[9px] font-medium transition-colors border border-slate-700">
            <Pause size={8} /> Pause
          </button>
          <button className="flex-1 flex items-center justify-center gap-1 py-1 px-1 rounded bg-slate-800 hover:bg-slate-750 text-[9px] font-medium transition-colors border border-slate-700">
            <Play size={8} /> Resume
          </button>
        </div>
      </div>

      {/* Logs Section */}
      <div className="border-t border-slate-800">
        <button
          onClick={() => setShowLogs(!showLogs)}
          className="w-full flex items-center justify-between px-2 py-1.5 text-[9px] text-slate-500 hover:text-slate-300 transition-colors"
        >
          <div className="flex items-center gap-1">
            <Terminal size={8} />
            LOGS
          </div>
          {showLogs ? <ChevronUp size={8} /> : <ChevronDown size={8} />}
        </button>

        {showLogs && (
          <div className="px-2 pb-2 max-h-[80px] overflow-y-auto font-mono text-[8px] text-slate-500 bg-slate-950/50 pt-0.5">
            {data.logs.map((log, i) => (
              <div key={i} className="mb-0.5 whitespace-nowrap overflow-hidden text-ellipsis">
                <span className="text-slate-700 mr-1">
                  {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                {log}
              </div>
            ))}
          </div>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="w-2 h-2 bg-slate-700 border-2 border-slate-900"
      />
      <Handle
        type="source"
        id="right-source"
        position={Position.Right}
        className="w-2 h-2 bg-slate-700 border-2 border-slate-900"
      />
    </div>
  );
});
