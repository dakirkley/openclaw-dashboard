import { useState, useEffect } from 'react';
import { useDashboardData } from '../hooks/useDashboardData';
import { Server, RefreshCw, Wrench, ChevronDown, ChevronRight, Cpu, Layers } from 'lucide-react';
import type { Skill } from '../types';

export function MachinesView() {
  const { machines, machineSkills, isLoaded, error, fetchMachineSkills } = useDashboardData();
  const [expandedMachine, setExpandedMachine] = useState<string | null>(null);
  const [localMachineSkills, setLocalMachineSkills] = useState<Record<string, Skill[]>>({});
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (expandedMachine && !localMachineSkills[expandedMachine] && !machineSkills[expandedMachine]) {
      loadMachineSkills(expandedMachine);
    }
  }, [expandedMachine]);

  const loadMachineSkills = async (machineId: string) => {
    try {
      const skills = await fetchMachineSkills(machineId);
      setLocalMachineSkills(prev => ({ ...prev, [machineId]: skills }));
    } catch (err) {
      console.error('Failed to load skills:', err);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    window.location.reload();
  };

  const toggleMachine = (machineId: string) => {
    setExpandedMachine(expandedMachine === machineId ? null : machineId);
  };

  const getSkillsForMachine = (machineId: string): Skill[] => {
    return localMachineSkills[machineId] || machineSkills[machineId] || [];
  };

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400">
          <p className="font-medium">Error loading machines</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Server className="w-6 h-6 text-cyan-400" />
            Machines
          </h1>
          <p className="text-slate-400 mt-1">
            {machines.length} machine{machines.length !== 1 ? 's' : ''} connected
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {machines.length === 0 ? (
        <div className="bg-slate-800/50 rounded-lg p-8 text-center">
          <Server className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-300 mb-2">No machines connected</h3>
          <p className="text-slate-400 text-sm">
            Run the sync tool on your OpenClaw instance to register machines and sync skills.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {machines.map((machine) => {
            const skills = getSkillsForMachine(machine.id);
            return (
              <div
                key={machine.id}
                className="bg-slate-800/50 border border-slate-700 rounded-lg overflow-hidden"
              >
                <button
                  onClick={() => toggleMachine(machine.id)}
                  className="w-full flex items-center justify-between p-4 hover:bg-slate-800 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {expandedMachine === machine.id ? (
                      <ChevronDown className="w-5 h-5 text-slate-400" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-slate-400" />
                    )}
                    <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                      <Cpu className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-medium text-white">{machine.name}</h3>
                      <p className="text-sm text-slate-400">{machine.nodeId}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      <Layers className="w-4 h-4" />
                      <span>{skills.length} skills</span>
                    </div>
                    <span className="text-xs text-slate-500">
                      {machine.lastSyncAt ? new Date(machine.lastSyncAt).toLocaleDateString() : 'Never synced'}
                    </span>
                  </div>
                </button>

                {expandedMachine === machine.id && (
                  <div className="border-t border-slate-700 p-4">
                    <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                      <div>
                        <span className="text-slate-500">Version:</span>
                        <span className="text-slate-300 ml-2">{machine.version || 'Unknown'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">Platform:</span>
                        <span className="text-slate-300 ml-2">{machine.platform || 'Unknown'}</span>
                      </div>
                      {machine.businessName && (
                        <div>
                          <span className="text-slate-500">Business:</span>
                          <span className="text-slate-300 ml-2">{machine.businessName}</span>
                        </div>
                      )}
                      <div>
                        <span className="text-slate-500">Last Seen:</span>
                        <span className="text-slate-300 ml-2">
                          {machine.lastSyncAt ? new Date(machine.lastSyncAt).toLocaleString() : 'Never'}
                        </span>
                      </div>
                    </div>

                    <h4 className="text-sm font-medium text-slate-300 mb-3 flex items-center gap-2">
                      <Wrench className="w-4 h-4 text-cyan-400" />
                      Skills ({skills.length})
                    </h4>

                    {skills.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {skills.map((skill) => (
                          <div
                            key={skill.id}
                            className="bg-slate-900/50 rounded-lg p-3 border border-slate-700"
                          >
                            <div className="flex items-start justify-between">
                              <h5 className="font-medium text-slate-200 text-sm">{skill.name}</h5>
                              {skill.version && skill.version !== 'unknown' && (
                                <span className="text-xs text-slate-500">{skill.version}</span>
                              )}
                            </div>
                            {skill.description && (
                              <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                                {skill.description}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center py-8 text-slate-500">
                        No skills synced yet
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
