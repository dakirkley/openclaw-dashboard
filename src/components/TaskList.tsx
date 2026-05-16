import React, { useState } from 'react';
import * as Icons from './icons';

interface Task {
  id: string;
  businessId: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: string;
  createdAt: string;
}

interface TaskListProps {
  tasks: Task[];
  businessId?: string;
  onAddTask?: (task: Omit<Task, 'id' | 'createdAt'>) => void;
}

export const TaskList: React.FC<TaskListProps> = ({ tasks, businessId, onAddTask }) => {
  const [filter, setFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium' as Task['priority'],
    status: 'pending' as Task['status']
  });

  const businessTasks = businessId
    ? tasks.filter(t => t.businessId === businessId)
    : tasks;

  const filteredTasks = businessTasks.filter(task => {
    if (filter === 'all') return true;
    return task.status === filter;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-400 bg-red-500/10';
      case 'high': return 'text-orange-400 bg-orange-500/10';
      case 'medium': return 'text-yellow-400 bg-yellow-500/10';
      case 'low': return 'text-green-400 bg-green-500/10';
      default: return 'text-dark-400 bg-dark-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <Icons.CheckCircle className="w-5 h-5 text-green-400" />;
      case 'in_progress': return <Icons.Clock className="w-5 h-5 text-yellow-400" />;
      case 'cancelled': return <Icons.X className="w-5 h-5 text-red-400" />;
      default: return <Icons.Circle className="w-5 h-5 text-dark-500" />;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Tasks</h1>
          <p className="text-dark-400 mt-1">Manage your to-dos</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="btn-primary">
          <Icons.Plus className="w-4 h-4" />
          Add Task
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-white">{businessTasks.filter(t => t.status === 'pending').length}</div>
          <div className="text-sm text-dark-400">Pending</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-white">{businessTasks.filter(t => t.status === 'in_progress').length}</div>
          <div className="text-sm text-dark-400">In Progress</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-white">{businessTasks.filter(t => t.status === 'completed').length}</div>
          <div className="text-sm text-dark-400">Completed</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-white">{businessTasks.length}</div>
          <div className="text-sm text-dark-400">Total</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {['all', 'pending', 'in_progress', 'completed'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === f ? 'bg-primary-500 text-white' : 'bg-dark-800 text-dark-400 hover:text-white'
            }`}
          >
            {f.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Task List */}
      {filteredTasks.length === 0 ? (
        <div className="card text-center py-12">
          <Icons.CheckSquare className="w-12 h-12 text-dark-600 mx-auto mb-3" />
          <p className="text-dark-400">No tasks yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((task) => (
            <div key={task.id} className="card group">
              <div className="flex items-start gap-4">
                {getStatusIcon(task.status)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className={`font-medium ${task.status === 'completed' ? 'text-dark-500 line-through' : 'text-white'}`}>
                      {task.title}
                    </h3>
                    <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                  </div>
                  {task.description && (
                    <p className={`text-sm mt-1 ${task.status === 'completed' ? 'text-dark-600' : 'text-dark-400'}`}>
                      {task.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-dark-900 border border-dark-800 rounded-2xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold text-white mb-4">Add Task</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-1">Title</label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                  className="input w-full"
                  placeholder="Enter task title"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-1">Description</label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                  className="input w-full h-24 resize-none"
                  placeholder="Enter task description"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-1">Priority</label>
                <select
                  value={newTask.priority}
                  onChange={(e) => setNewTask({...newTask, priority: e.target.value as Task['priority']})}
                  className="input w-full"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  if (onAddTask && newTask.title.trim()) {
                    onAddTask({
                      ...newTask,
                      businessId: businessId || ''
                    });
                    setNewTask({ title: '', description: '', priority: 'medium', status: 'pending' });
                    setIsModalOpen(false);
                  }
                }}
                disabled={!newTask.title.trim() || !onAddTask}
                className="btn-primary flex-1"
              >
                Add Task
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
