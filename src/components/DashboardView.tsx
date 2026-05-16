import React from 'react';
import type { DashboardData, BusinessData } from '../types';
import * as Icons from './icons';

interface DashboardViewProps {
  data: DashboardData;
  stats: {
    totalBusinesses: number;
    totalBots: number;
    totalSubAgents: number;
    totalSkills: number;
    totalApis: number;
    activeBots: number;
    activeSubAgents: number;
  };
  onViewChange: (view: string) => void;
  onBusinessSelect: (business: BusinessData) => void;
  isMobile?: boolean;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ data, stats, onViewChange, onBusinessSelect, isMobile }) => {

  const statCards = [
    { label: 'Businesses', value: stats.totalBusinesses, icon: Icons.Building2, color: 'text-blue-400', bgColor: 'bg-blue-500/10', borderColor: 'border-blue-500/20', onClick: () => onViewChange('businesses') },
    { label: 'Bots', value: stats.totalBots, subValue: `${stats.activeBots} active`, icon: Icons.Bot, color: 'text-green-400', bgColor: 'bg-green-500/10', borderColor: 'border-green-500/20', onClick: () => onViewChange('businesses') },
    { label: 'Sub-Agents', value: stats.totalSubAgents, subValue: `${stats.activeSubAgents} active`, icon: Icons.Network, color: 'text-purple-400', bgColor: 'bg-purple-500/10', borderColor: 'border-purple-500/20', onClick: () => onViewChange('businesses') },
    { label: 'Skills', value: stats.totalSkills, icon: Icons.Puzzle, color: 'text-orange-400', bgColor: 'bg-orange-500/10', borderColor: 'border-orange-500/20', onClick: () => onViewChange('businesses') },
    { label: 'APIs', value: stats.totalApis, icon: Icons.Key, color: 'text-pink-400', bgColor: 'bg-pink-500/10', borderColor: 'border-pink-500/20', onClick: () => onViewChange('businesses') },
  ];

  // Get pending tasks sorted by priority and due date
  const pendingTasks = data.tasks
    .filter(t => t.status !== 'completed' && t.status !== 'cancelled')
    .sort((a, b) => {
      const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      if (a.dueDate && b.dueDate) {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      return a.dueDate ? -1 : b.dueDate ? 1 : 0;
    })
    .slice(0, 5);

  const overdueCount = data.tasks.filter(t => {
    if (!t.dueDate || t.status === 'completed' || t.status === 'cancelled') return false;
    return new Date(t.dueDate) < new Date();
  }).length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-dark-400 mt-1">Overview of all your OpenClaw deployments</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => onViewChange('tasks')} className="btn-secondary">
            <Icons.CheckSquare className="w-4 h-4" />View Tasks
          </button>
          <button onClick={() => onViewChange('businesses')} className="btn-primary">
            <Icons.Plus className="w-4 h-4" />Add Business
          </button>
        </div>
      </div>

      <div className={`grid gap-4 ${isMobile ? 'grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-5'}`}>
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <button key={stat.label} onClick={stat.onClick} className={`stat-card text-left group ${stat.borderColor}`}>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}><Icon className={`w-5 h-5 ${stat.color}`} /></div>
              <div className="mt-4">
                <p className="text-3xl font-bold text-white">{stat.value}</p>
                <p className="text-sm text-dark-400 mt-1">{stat.label}</p>
                {stat.subValue && <p className="text-xs text-dark-500 mt-0.5">{stat.subValue}</p>}
              </div>
            </button>
          );
        })}
      </div>

      {/* Task Stats Summary */}
      {data.tasks && data.tasks.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold text-white">Tasks Overview</h2>
              {overdueCount > 0 && (
                <span className="bg-red-500/10 text-red-400 text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1">
                  <Icons.AlertCircle className="w-3 h-3" />
                  {overdueCount} overdue
                </span>
              )}
            </div>
            <button onClick={() => onViewChange('tasks')} className="text-sm text-primary-400 hover:text-primary-300">
              View All
            </button>
          </div>
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{data.tasks.filter(t => t.status === 'pending').length}</div>
              <div className="text-xs text-dark-400">Pending</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{data.tasks.filter(t => t.status === 'in_progress').length}</div>
              <div className="text-xs text-dark-400">In Progress</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{data.tasks.filter(t => t.status === 'completed').length}</div>
              <div className="text-xs text-dark-400">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{data.tasks.length}</div>
              <div className="text-xs text-dark-400">Total</div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => onViewChange('businesses')} className="p-4 bg-dark-800 hover:bg-dark-700 rounded-lg text-left transition-colors group">
              <Icons.Building2 className="w-6 h-6 text-blue-400 mb-2 group-hover:scale-110 transition-transform" />
              <p className="font-medium text-dark-100">New Business</p>
              <p className="text-xs text-dark-500 mt-1">Add a new OpenClaw instance</p>
            </button>
            <button onClick={() => onViewChange('tasks')} className="p-4 bg-dark-800 hover:bg-dark-700 rounded-lg text-left transition-colors group">
              <Icons.CheckSquare className="w-6 h-6 text-primary-400 mb-2 group-hover:scale-110 transition-transform" />
              <p className="font-medium text-dark-100">View Tasks</p>
              <p className="text-xs text-dark-500 mt-1">{data.tasks.filter(t => t.status !== 'completed' && t.status !== 'cancelled').length} pending tasks</p>
            </button>
            <button onClick={() => onViewChange('businesses')} className="p-4 bg-dark-800 hover:bg-dark-700 rounded-lg text-left transition-colors group">
              <Icons.Bot className="w-6 h-6 text-green-400 mb-2 group-hover:scale-110 transition-transform" />
              <p className="font-medium text-dark-100">Manage Bots</p>
              <p className="text-xs text-dark-500 mt-1">View and add bots</p>
            </button>
            <button onClick={() => onViewChange('businesses')} className="p-4 bg-dark-800 hover:bg-dark-700 rounded-lg text-left transition-colors group">
              <Icons.Puzzle className="w-6 h-6 text-orange-400 mb-2 group-hover:scale-110 transition-transform" />
              <p className="font-medium text-dark-100">Manage Skills</p>
              <p className="text-xs text-dark-500 mt-1">View and add skills</p>
            </button>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Priority Tasks</h2>
            <button onClick={() => onViewChange('tasks')} className="text-sm text-primary-400 hover:text-primary-300">View All</button>
          </div>
          <div className="space-y-3">
            {pendingTasks.length === 0 ? (
              <div className="text-center py-8">
                <Icons.CheckCircle className="w-12 h-12 text-dark-600 mx-auto mb-3" />
                <p className="text-dark-400">No pending tasks</p>
                <p className="text-sm text-dark-500 mt-1">You're all caught up!</p>
                <button onClick={() => onViewChange('tasks')} className="mt-4 text-sm text-primary-400 hover:text-primary-300">
                  Create a task
                </button>
              </div>
            ) : (
              pendingTasks.map((task) => {
                const isOverdue = task.dueDate && new Date(task.dueDate) < new Date();
                const priorityColors = {
                  urgent: 'text-red-400 bg-red-500/10 border-red-500/20',
                  high: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
                  medium: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
                  low: 'text-green-400 bg-green-500/10 border-green-500/20',
                };
                return (
                  <div key={task.id} onClick={() => onViewChange('tasks')} className="flex items-center gap-3 p-3 bg-dark-800/50 rounded-lg cursor-pointer hover:bg-dark-800 transition-colors">
                    <div className={`w-2 h-2 rounded-full ${task.priority === 'urgent' ? 'bg-red-400' : task.priority === 'high' ? 'bg-orange-400' : task.priority === 'medium' ? 'bg-yellow-400' : 'bg-green-400'}`} />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-dark-100 truncate">{task.title}</p>
                      <div className="flex items-center gap-2 text-xs text-dark-500">
                        <span className={`px-1.5 py-0.5 rounded text-xs ${priorityColors[task.priority]}`}>
                          {task.priority}
                        </span>
                        {task.dueDate && (
                          <span className={isOverdue ? 'text-red-400' : ''}>
                            {isOverdue && <Icons.AlertCircle className="w-3 h-3 inline mr-1" />}
                            Due {new Date(task.dueDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <Icons.ChevronRight className="w-5 h-5 text-dark-500" />
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {data.businesses.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Your Businesses</h2>
            <button onClick={() => onViewChange('businesses')} className="text-sm text-primary-400 hover:text-primary-300">View All</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.businesses.map((businessData) => (
              <div key={businessData.business.id} onClick={() => onBusinessSelect(businessData)} className="p-4 bg-dark-800/50 rounded-lg border border-dark-700 hover:border-dark-600 transition-colors cursor-pointer">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${businessData.business.color}20` }}>
                      <Icons.Building2 className="w-5 h-5" style={{ color: businessData.business.color }} />
                    </div>
                    <div>
                      <p className="font-medium text-dark-100">{businessData.business.name}</p>
                      <p className="text-xs text-dark-500 truncate max-w-[150px]">{businessData.business.endpointUrl}</p>
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1.5"><Icons.Bot className="w-4 h-4 text-dark-500" /><span className="text-dark-400">{businessData.bots.length}</span></div>
                  <div className="flex items-center gap-1.5"><Icons.Network className="w-4 h-4 text-dark-500" /><span className="text-dark-400">{businessData.subAgents.length}</span></div>
                  <div className="flex items-center gap-1.5"><Icons.Puzzle className="w-4 h-4 text-dark-500" /><span className="text-dark-400">{businessData.skills.length}</span></div>
                  <div className="flex items-center gap-1.5"><Icons.Key className="w-4 h-4 text-dark-500" /><span className="text-dark-400">{businessData.apis.length}</span></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
