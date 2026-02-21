import React, { useState } from 'react';
import { Plus } from 'lucide-react';

interface CreatePersonaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreatePersonaModal: React.FC<CreatePersonaModalProps> = ({ isOpen, onClose }) => {
  const [roleName, setRoleName] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('📄');
  const [prompt, setPrompt] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="bg-slate-900 border border-slate-800 rounded-xl shadow-2xl w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
          <h3 className="text-lg font-bold text-white">Create New Persona</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
            <Plus size={20} className="rotate-45" />
          </button>
        </div>
        
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 tracking-wider">Role Name</label>
            <input 
              type="text" 
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
              placeholder="e.g. Documentation Specialist" 
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors" 
            />
          </div>
          
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 tracking-wider">Avatar / Icon</label>
            <div className="flex gap-2">
              {['📄', '🛡️', '🧪', '🎨', '📈', '🤖', '🔍', '💻'].map(emoji => (
                <button 
                  key={emoji} 
                  onClick={() => setSelectedEmoji(emoji)}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center border transition-all ${
                    selectedEmoji === emoji 
                      ? 'bg-blue-600/20 border-blue-500 text-white' 
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 tracking-wider">System Prompt</label>
            <textarea 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Define the agent's behavior and constraints..." 
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-blue-500 min-h-[120px] resize-none transition-colors" 
            />
          </div>
        </div>
        
        <div className="p-6 bg-slate-950/50 flex gap-3">
          <button 
            onClick={onClose} 
            className="flex-1 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 text-sm font-medium transition-colors border border-slate-700"
          >
            Cancel
          </button>
          <button 
            onClick={onClose} 
            className="flex-1 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors shadow-lg shadow-blue-500/20"
          >
            Create Persona
          </button>
        </div>
      </div>
    </div>
  );
};

export default React.memo(CreatePersonaModal);
