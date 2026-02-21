import React, { useState, useEffect } from 'react';
import { Trash2 } from 'lucide-react';
import type { Persona } from '../types';
import { ConfirmationModal } from './ConfirmationModal';

export const PersonaSidebar: React.FC = () => {
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [personaToDelete, setPersonaToDelete] = useState<string | null>(null);

  const fetchPersonas = async () => {
    setIsLoading(true);
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

  useEffect(() => {
    fetchPersonas();
  }, []);

  const handleDeletePersona = async () => {
    if (!personaToDelete) return;

    try {
      const response = await fetch(`/api/personas/${personaToDelete}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setPersonas((prev) => prev.filter((p) => p.id !== personaToDelete));
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to delete persona');
      }
    } catch (error) {
      console.error('Failed to delete persona:', error);
    } finally {
      setPersonaToDelete(null);
    }
  };

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
              className="p-3 bg-slate-800 border border-slate-700 rounded-lg cursor-grab active:cursor-grabbing hover:border-blue-500/50 transition-colors group relative"
              onDragStart={(event) => onDragStart(event, persona.id)}
              draggable
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{persona.avatar}</span>
                  <span className="font-medium text-slate-200">{persona.name}</span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setPersonaToDelete(persona.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 hover:text-red-500 rounded transition-all"
                    title="Delete Persona"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
              <p className="text-[10px] text-slate-500 line-clamp-2 italic">
                {persona.description || `Skill: ${persona.skill}`}
              </p>
            </div>
          ))
        )}
      </div>

      <ConfirmationModal
        isOpen={!!personaToDelete}
        title="Delete Persona?"
        message={
          <>
            Are you sure you want to delete{' '}
            <strong>{personas.find((p) => p.id === personaToDelete)?.name}</strong>? This will
            permanently remove it from the library.
          </>
        }
        onConfirm={handleDeletePersona}
        onCancel={() => setPersonaToDelete(null)}
      />
    </aside>
  );
};
