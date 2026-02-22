import React from 'react';
import { Position } from 'reactflow';
import type { Agent } from '../types';
import { TerminalNode } from './TerminalNode';

interface StartNodeProps {
  data: Agent;
}

export const StartNode: React.FC<StartNodeProps> = React.memo(({ data }) => {
  return (
    <TerminalNode
      data={data}
      type="start"
      title="Start"
      summaryFallback="Workflow entry point."
      footer="Begin"
      handle={{
        type: 'source',
        position: Position.Bottom,
        className: 'w-2 h-2 bg-emerald-500 border-2 border-slate-900',
      }}
    />
  );
});
