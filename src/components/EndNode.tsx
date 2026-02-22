import React from 'react';
import { Handle, Position } from 'reactflow';
import type { Agent } from '../types';

interface EndNodeProps {
  data: Agent;
}

export const EndNode: React.FC<EndNodeProps> = React.memo(({ data }) => {
  return (
    <div className="bg-slate-900 border border-amber-700/60 rounded-lg shadow-2xl w-[170px] text-slate-200 overflow-hidden">
      <Handle
        type="target"
        position={Position.Top}
        className="w-2 h-2 bg-amber-500 border-2 border-slate-900"
      />

      <div className="p-2 border-b border-slate-800 bg-amber-900/20">
        <div className="text-[10px] font-bold uppercase tracking-widest text-amber-300">
          End
        </div>
        <div className="text-[10px] text-amber-400/70 mt-1">
          {data.summary || 'Workflow completion point.'}
        </div>
      </div>

      <div className="px-2 py-2 text-[9px] text-amber-300">Complete</div>
    </div>
  );
});
