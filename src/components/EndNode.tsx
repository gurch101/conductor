import React from 'react';
import { Position } from 'reactflow';
import type { Agent } from '../types';
import { TerminalNode } from './TerminalNode';

interface EndNodeProps {
  data: Agent;
}

export const EndNode: React.FC<EndNodeProps> = React.memo(({ data }) => {
  return (
    <TerminalNode
      data={data}
      type="end"
      title="End"
      summaryFallback="Workflow completion point."
      footer="Complete"
      handle={{
        type: 'target',
        position: Position.Top,
        className: 'w-2 h-2 bg-amber-500 border-2 border-slate-900',
      }}
    />
  );
});
