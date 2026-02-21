import React, { useState, useEffect } from 'react';
import { Plus, Info } from 'lucide-react';
import { Persona } from '../types';

interface PersonaSidebarProps {
  onCreateClick: () => void;
}

export const PersonaSidebar: React.FC<PersonaSidebarProps> = ({ onCreateClick }) => {
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPersonas = async () => {
      try {
        const response = await fetch('/api/personas');
        const data = await response.json();
        setPersonas(data);
      } catch (error) {
        console.error('Failed to fetch personas:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPersonas();
  }, []);

  const onDragStart = (event: React.DragEvent, personaId: string) => {
    event.dataTransfer.setData('application/reactflow/personaId', personaId);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <aside className="w-64 border-r border-slate-800 bg-slate-900/50 flex flex-col h-full shrink-0">
      <div className="p-4 border-b border-slate-800 shrink-0">
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
          Persona Library
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {isLoading ? (
          <div className="flex justify-center p-4">
            <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          personas.map((persona) => (
            <div
              key={persona.id}
              className="p-3 bg-slate-800 border border-slate-700 rounded-lg cursor-grab active:cursor-grabbing hover:border-blue-500/50 transition-colors group"
              onDragStart={(event) => onDragStart(event, persona.id)}
              draggable
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{persona.avatar}</span>
                  <span className="font-medium text-slate-200">{persona.name}</span>
                </div>
                <Info size={14} className="text-slate-600 group-hover:text-slate-400" />
              </div>
              <p className="text-[10px] text-slate-500 line-clamp-2 italic">
                {persona.systemPrompt}
              </p>
            </div>
          ))
        )}
      </div>

      <div className="p-4 border-t border-slate-800 shrink-0">
        <button
          onClick={onCreateClick}
          className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors"
        >
          <Plus size={16} />
          Create Persona
        </button>
      </div>
    </aside>
  );
};
