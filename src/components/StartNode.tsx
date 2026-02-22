import React from 'react';
import { Handle, Position } from 'reactflow';
import type { Agent } from '../types';

interface StartNodeProps {
  data: Agent;
}

export const StartNode: React.FC<StartNodeProps> = React.memo(({ data }) => {
  return (
    <div className="bg-slate-900 border border-emerald-700/60 rounded-lg shadow-2xl w-[170px] text-slate-200 overflow-hidden">
      <div className="p-2 border-b border-slate-800 bg-emerald-900/20">
        <div className="text-[10px] font-bold uppercase tracking-widest text-emerald-300">
          Start
        </div>
        <div className="text-[10px] text-emerald-400/70 mt-1">
          {data.summary || 'Workflow entry point.'}
        </div>
      </div>

      <div className="px-2 py-2 text-[9px] text-emerald-300">Begin</div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="w-2 h-2 bg-emerald-500 border-2 border-slate-900"
      />
    </div>
  );
});
