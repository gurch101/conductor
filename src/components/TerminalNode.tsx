import React from 'react';
import { Handle, Position } from 'reactflow';
import type { Agent } from '../types';

type HandleConfig = {
  type: 'source' | 'target';
  position: Position;
  className: string;
};

type TerminalNodeType = 'start' | 'end';

interface TerminalNodeProps {
  data: Agent;
  type: TerminalNodeType;
  title: string;
  summaryFallback: string;
  footer: string;
  handle?: HandleConfig;
}

export const TerminalNode: React.FC<TerminalNodeProps> = React.memo(
  ({ data, type, title, summaryFallback, footer, handle }) => {
    const styles =
      type === 'start'
        ? {
            container:
              'bg-slate-900 border border-emerald-700/60 rounded-lg shadow-2xl w-[170px] text-slate-200 overflow-hidden',
            header: 'p-2 border-b border-slate-800 bg-emerald-900/20',
            title: 'text-[10px] font-bold uppercase tracking-widest text-emerald-300',
            summary: 'text-[10px] text-emerald-400/70 mt-1',
            footer: 'px-2 py-2 text-[9px] text-emerald-300',
          }
        : {
            container:
              'bg-slate-900 border border-amber-700/60 rounded-lg shadow-2xl w-[170px] text-slate-200 overflow-hidden',
            header: 'p-2 border-b border-slate-800 bg-amber-900/20',
            title: 'text-[10px] font-bold uppercase tracking-widest text-amber-300',
            summary: 'text-[10px] text-amber-400/70 mt-1',
            footer: 'px-2 py-2 text-[9px] text-amber-300',
          };

    return (
      <div className={styles.container}>
        {handle && (
          <Handle type={handle.type} position={handle.position} className={handle.className} />
        )}

        <div className={styles.header}>
          <div className={styles.title}>{title}</div>
          <div className={styles.summary}>{data.summary || summaryFallback}</div>
        </div>

        <div className={styles.footer}>{footer}</div>
      </div>
    );
  }
);
