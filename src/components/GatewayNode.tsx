import React from 'react';
import { Handle, Position } from 'reactflow';
import type { Agent } from '../types';

interface GatewayNodeProps {
  data: Agent;
}

export const GatewayNode: React.FC<GatewayNodeProps> = React.memo(({ data }) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg shadow-2xl w-[190px] text-slate-200 overflow-hidden">
      <Handle
        type="target"
        position={Position.Top}
        className="w-2 h-2 bg-slate-700 border-2 border-slate-900"
      />

      <div className="p-2 border-b border-slate-800 bg-slate-900/60">
        <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
          Gateway
        </div>
        <div className="text-[10px] text-slate-500 mt-1">
          {data.summary || 'Route based on outcome.'}
        </div>
      </div>

      <div className="px-2 py-2 flex items-center justify-between text-[9px]">
        <span className="text-emerald-400">PASS</span>
        <span className="text-rose-400">FAIL</span>
      </div>

      <Handle
        type="source"
        id="pass"
        position={Position.Bottom}
        style={{ left: 50 }}
        className="w-2 h-2 bg-emerald-500 border-2 border-slate-900"
      />
      <Handle
        type="source"
        id="fail"
        position={Position.Bottom}
        style={{ left: 140 }}
        className="w-2 h-2 bg-rose-500 border-2 border-slate-900"
      />
    </div>
  );
});
