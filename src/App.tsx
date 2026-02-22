import React, { useState, useCallback, useEffect, useRef } from 'react';
import { ReactFlowProvider } from 'reactflow';
import type { Team, Agent } from './types';
import { TeamCard } from './components/TeamCard';
import { FlowCanvas } from './components/FlowCanvas';
import { PersonaSidebar } from './components/PersonaSidebar';
import { AgentChat } from './components/AgentChat';
import { ConfirmationModal } from './components/ConfirmationModal';
import { Plus, ArrowLeft } from 'lucide-react';
import './index.css';

type View = 'dashboard' | 'builder' | 'agent-chat';

export function App() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [isLoading, setIsLoading] = useState(true);
  const [isNewTeam, setIsNewTeam] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [teamToDelete, setTeamToDelete] = useState<string | null>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const objectiveRef = useRef<HTMLTextAreaElement>(null);

  const showError = (msg: string) => {
    setError(msg);
    setTimeout(() => setError(null), 5000);
  };

  const fetchTeams = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/teams');
      const data = await response.json();
      setTeams(data);
    } catch (error) {
      console.error('Failed to fetch teams:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  const handleTeamClick = (team: Team) => {
    setSelectedTeam(team);
    setIsNewTeam(false);
    const agentNeedingAttention = team.agents.find((a) => a.status === 'waiting_approval');
    if (agentNeedingAttention) {
      setSelectedAgent(agentNeedingAttention);
      setCurrentView('agent-chat');
    } else {
      setCurrentView('builder');
    }
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
    setSelectedTeam(null);
    setIsNewTeam(false);
    fetchTeams();
  };

  const handleAddTeam = async () => {
    try {
      // Try to create with a unique name by checking existing names
      let name = 'New Agent Team';
      let counter = 1;
      while (teams.some((t) => t.name.toLowerCase() === name.toLowerCase())) {
        name = `New Agent Team ${++counter}`;
      }

      const response = await fetch('/api/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          objective: '',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        showError(errorData.error || 'Failed to create team');
        return;
      }

      const newTeam = await response.json();
      setTeams([newTeam, ...teams]);
      setSelectedTeam(newTeam);
      setIsNewTeam(true);
      setCurrentView('builder');
    } catch (error) {
      console.error('Failed to create team:', error);
      showError('An unexpected error occurred while creating the team.');
    }
  };

  const handleDeleteTeam = async () => {
    if (!teamToDelete) return;

    try {
      const response = await fetch(`/api/teams/${teamToDelete}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        showError('Failed to delete team.');
        return;
      }

      setTeams((prev) => prev.filter((t) => t.id !== teamToDelete));
      setTeamToDelete(null);
    } catch (error) {
      console.error('Failed to delete team:', error);
      showError('An error occurred while deleting the team.');
    }
  };

  const onUpdateTeam = useCallback((updatedTeam: Team) => {
    // In a real app, we might want to debounced-save to backend here
    setTeams((prevTeams) => prevTeams.map((t) => (t.id === updatedTeam.id ? updatedTeam : t)));
    setSelectedTeam(updatedTeam);
  }, []);

  const handleSaveTeam = async () => {
    if (!selectedTeam) return;

    // Save latest details before "creating" (finishing)
    const name = nameRef.current?.value || '';
    const objective = objectiveRef.current?.value || selectedTeam.objective;

    if (!name || name.trim() === '') {
      showError('Team name is required.');
      return;
    }

    try {
      const response = await fetch(`/api/teams/${selectedTeam.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          objective,
          agents: selectedTeam.agents,
          connections: selectedTeam.connections,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        showError(errorData.error || 'Failed to save team');
        return;
      }

      const updatedTeam = { ...selectedTeam, name, objective };
      setSelectedTeam(updatedTeam);
      setTeams((prev) => prev.map((t) => (t.id === updatedTeam.id ? updatedTeam : t)));
      handleBackToDashboard();
    } catch (error) {
      console.error('Failed to save team:', error);
      showError('An unexpected error occurred while saving the team.');
    }
  };

  const handleApproveAgent = async (agentId: string) => {
    if (!selectedTeam) return;

    // For now, mock the approval update on the frontend
    const updatedTeam = {
      ...selectedTeam,
      agents: selectedTeam.agents.map((a) =>
        a.id === agentId
          ? { ...a, status: 'done' as const, logs: [...a.logs, 'User approved execution.'] }
          : a
      ),
    };

    setTeams((prev) => prev.map((t) => (t.id === updatedTeam.id ? updatedTeam : t)));
    setSelectedTeam(updatedTeam);
    setCurrentView('dashboard');
  };

  return (
    <div className="h-screen bg-slate-950 text-slate-200 flex flex-col font-sans overflow-hidden">
      <header className="h-16 border-b border-slate-800 px-6 flex items-center justify-between bg-slate-950/50 backdrop-blur-md shrink-0 z-50">
        <div className="flex items-center gap-4">
          <div
            className="w-8 h-8 flex items-center justify-center text-xl cursor-pointer hover:scale-110 transition-transform"
            onClick={handleBackToDashboard}
          >
            🪄
          </div>
          <h1 className="text-lg font-bold tracking-tight">
            conductor<span className="text-blue-500">.ai</span>
          </h1>
        </div>

        {currentView === 'builder' ? (
          <div className="flex items-center gap-3">
            <button
              onClick={handleBackToDashboard}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-sm font-medium transition-colors"
            >
              <ArrowLeft size={16} /> Back
            </button>
            <button
              onClick={handleSaveTeam}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors shadow-lg shadow-blue-500/20"
            >
              {isNewTeam ? 'Create Team' : 'Update Team'}
            </button>
          </div>
        ) : currentView === 'dashboard' ? (
          <button
            onClick={handleAddTeam}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors shadow-lg shadow-blue-500/20"
          >
            <Plus size={16} /> Add Team
          </button>
        ) : null}
      </header>

      <main className="flex-1 flex overflow-hidden relative">
        {currentView === 'dashboard' && (
          <div className="flex-1 overflow-y-auto p-8 h-full">
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-bold text-white mb-2">Team Dashboard</h2>
                  <p className="text-slate-400">
                    Manage and monitor your multi-agent orchestration workflows.
                  </p>
                </div>
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {teams.map((team) => (
                    <TeamCard
                      key={team.id}
                      team={team}
                      onClick={handleTeamClick}
                      onDelete={(id) => setTeamToDelete(id)}
                    />
                  ))}
                  <button
                    onClick={handleAddTeam}
                    className="border-2 border-dashed border-slate-800 rounded-xl p-5 hover:border-slate-700 hover:bg-slate-900/50 transition-all flex flex-col items-center justify-center gap-3 min-h-[200px] group"
                  >
                    <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 group-hover:text-blue-500 group-hover:border-blue-500 transition-colors">
                      <Plus size={24} />
                    </div>
                    <span className="text-slate-500 font-medium group-hover:text-slate-300">
                      Create New Team
                    </span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        <ConfirmationModal
          isOpen={!!teamToDelete}
          title="Delete Team?"
          message={
            <>
              This will permanently remove{' '}
              <strong>{teams.find((t) => t.id === teamToDelete)?.name}</strong> and all its agents,
              connections, and logs. This action cannot be undone.
            </>
          }
          onConfirm={handleDeleteTeam}
          onCancel={() => setTeamToDelete(null)}
        />

        {currentView === 'builder' && selectedTeam && (
          <div className="flex-1 flex w-full h-full relative overflow-hidden">
            <PersonaSidebar />
            <div className="flex-1 flex flex-col h-full bg-slate-950 relative min-w-0">
              {error && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[60] bg-red-500/90 backdrop-blur text-white px-4 py-2 rounded-lg shadow-lg border border-red-400 flex items-center gap-2 animate-in fade-in slide-in-from-top-4">
                  <span className="font-bold">Error:</span>
                  <span>{error}</span>
                </div>
              )}
              <div className="p-4 bg-slate-900/80 backdrop-blur border-b border-slate-800 shrink-0 z-10 flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                    Team Name
                  </span>
                  <div className="relative group/name">
                    <input
                      ref={nameRef}
                      key={`name-${selectedTeam.id}`}
                      defaultValue={selectedTeam.name}
                      placeholder="Enter team name..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-lg text-white focus:outline-none focus:border-blue-500 transition-colors group-hover/name:border-slate-700"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                      Global Team Goal
                    </span>
                    <span className="text-xs text-slate-600">
                      Drag & drop personas to the canvas below
                    </span>
                  </div>
                  <div className="relative group">
                    <textarea
                      ref={objectiveRef}
                      key={`obj-${selectedTeam.id}`}
                      defaultValue={selectedTeam.objective}
                      placeholder="Describe the high-level goal for this team..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-lg text-slate-200 focus:outline-none focus:border-blue-500 transition-colors min-h-[140px] resize-none group-hover:border-slate-700"
                    />
                  </div>
                </div>
              </div>
              <div className="flex-1 relative w-full h-full">
                <ReactFlowProvider>
                  <FlowCanvas team={selectedTeam} onUpdate={onUpdateTeam} />
                </ReactFlowProvider>
              </div>
            </div>
          </div>
        )}

        {currentView === 'agent-chat' && selectedTeam && selectedAgent && (
          <AgentChat
            team={selectedTeam}
            agent={selectedAgent}
            onBack={() => setCurrentView('dashboard')}
            onApprove={handleApproveAgent}
          />
        )}
      </main>

      {currentView === 'dashboard' && (
        <footer className="h-10 border-t border-slate-800 px-6 flex items-center justify-between bg-slate-950 text-[10px] text-slate-600 shrink-0">
          <div className="flex gap-4">
            <span>SYSTEM: ONLINE</span>
            <span>AGENTS ACTIVE: {teams.reduce((a, b) => a + (b.agents?.length || 0), 0)}</span>
          </div>
          <div>v0.1.0-alpha</div>
        </footer>
      )}
    </div>
  );
}

export default App;
