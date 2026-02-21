import React, { useState, useRef, useEffect } from 'react';
import type { Team } from '../types';
import {
  Users,
  Coins,
  CheckCircle2,
  AlertCircle,
  PlayCircle,
  MoreVertical,
  Trash2,
} from 'lucide-react';

interface TeamCardProps {
  team: Team;
  onClick: (team: Team) => void;
  onDelete: (id: string) => void;
}

export const TeamCard: React.FC<TeamCardProps> = ({ team, onClick, onDelete }) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  const allDone = team.agents.length > 0 && team.agents.every((a) => a.status === 'done');
  const hasYellow = team.agents.some((a) => a.status === 'waiting_approval');
  const hasWorking = team.agents.some((a) => a.status === 'working');

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
  const cost = ((totalTokens / 1000) * 0.02).toFixed(2);

  return (
    <div
      onClick={() => onClick(team)}
      className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-all cursor-pointer group flex flex-col min-h-[200px] relative"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-start gap-1 min-w-0">
          <div className="relative shrink-0 mt-1" ref={menuRef}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              aria-label="Open menu"
              className="p-1 hover:bg-slate-800 rounded-md text-slate-500 hover:text-slate-300 transition-colors"
            >
              <MoreVertical size={16} />
            </button>

            {showMenu && (
              <div className="absolute left-0 mt-1 w-36 bg-slate-900 border border-slate-800 rounded-lg shadow-xl z-[60] py-1 animate-in fade-in zoom-in-95 duration-100">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(team.id);
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-slate-800 transition-colors"
                >
                  <Trash2 size={14} />
                  <span>Delete Team</span>
                </button>
              </div>
            )}
          </div>
          <h3 className="text-xl font-bold text-slate-100 group-hover:text-blue-400 transition-colors truncate">
            {team.name}
          </h3>
        </div>

        <div
          className={`px-2 py-1 rounded-full border text-[10px] flex items-center gap-1 shrink-0 ${statusColor}`}
        >
          <StatusIcon size={12} />
          {allDone ? 'Done' : hasYellow ? 'Action Needed' : 'Working'}
        </div>
      </div>

      <p className="text-slate-400 text-sm line-clamp-2 mb-6 italic">
        {team.objective || 'No objective set for this team yet...'}
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
      </div>
    </div>
  );
};
