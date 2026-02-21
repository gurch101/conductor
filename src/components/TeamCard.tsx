import React from 'react';
import { Team } from '../types';
import { Users, Coins, CheckCircle2, AlertCircle, PlayCircle } from 'lucide-react';

interface TeamCardProps {
  team: Team;
  onClick: (team: Team) => void;
}

export const TeamCard: React.FC<TeamCardProps> = ({ team, onClick }) => {
  const allDone = team.agents.length > 0 && team.agents.every(a => a.status === 'done');
  const hasYellow = team.agents.some(a => a.status === 'waiting_approval');
  const hasWorking = team.agents.some(a => a.status === 'working');

  let statusColor = 'border-slate-700 bg-slate-800/50 text-slate-500';
  let StatusIcon = PlayCircle;

  if (allDone) {
    statusColor = 'border-green-500 bg-green-500/10 text-green-400';
    StatusIcon = CheckCircle2;
  } else if (hasYellow) {
    statusColor = 'border-yellow-500 bg-yellow-500/10 text-yellow-400';
    StatusIcon = AlertCircle;
  } else if (hasWorking || team.agents.length > 0) {
    statusColor = 'border-blue-500 bg-blue-500/10 text-blue-400';
    StatusIcon = PlayCircle;
  }

  const totalTokens = team.agents.reduce((acc, curr) => acc + curr.tokensUsed, 0);
  const cost = (totalTokens / 1000 * 0.02).toFixed(2);

  return (
    <div 
      onClick={() => onClick(team)}
      className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-all cursor-pointer group flex flex-col min-h-[240px]"
    >
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-bold text-slate-100 group-hover:text-blue-400 transition-colors">
          {team.name}
        </h3>
        <div className={`px-2 py-1 rounded-full border text-xs flex items-center gap-1 shrink-0 ${statusColor}`}>
          <StatusIcon size={14} />
          {allDone ? 'Done' : hasYellow ? 'Action Needed' : 'Working'}
        </div>
      </div>
      
      <p className="text-slate-400 text-sm line-clamp-3 mb-6">
        {team.objective}
      </p>
      
      <div className="mt-auto pt-4 border-t border-slate-800/50 flex items-center justify-between text-slate-500 text-xs">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <Users size={16} className="text-slate-600" />
            <span>{team.agents.length} Agents</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Coins size={16} className="text-slate-600" />
            <span>${cost}</span>
          </div>
        </div>
        <span className="text-slate-600 font-mono">ID: {team.id}</span>
      </div>
    </div>
  );
};
