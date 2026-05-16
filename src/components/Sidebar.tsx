import React from 'react';
import * as Icons from './icons';

interface SidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobile?: boolean;
  onCloseMobile?: () => void;
  taskCount?: number;
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Icons.LayoutDashboard },
  { id: 'businesses', label: 'Businesses', icon: Icons.Building2 },
  { id: 'tasks', label: 'Tasks', icon: Icons.CheckSquare },
  { id: 'activity-log', label: 'Activity Log', icon: Icons.History },
  { id: 'memory-bank', label: 'Memory Bank', icon: Icons.Book },
  { id: 'settings', label: 'Settings', icon: Icons.Settings },
];

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onViewChange,
  isCollapsed,
  onToggleCollapse,
  isMobile,
  onCloseMobile,
  taskCount = 0
}) => {
  const handleNavClick = (viewId: string) => {
    onViewChange(viewId);
    if (isMobile && onCloseMobile) {
      onCloseMobile();
    }
  };

  return (
    <aside 
      className={`bg-dark-900 border-r border-dark-800 flex flex-col h-full ${
        isMobile ? 'w-64' : isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Logo */}
      <div className="h-16 flex items-center px-4 border-b border-dark-800">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
          <Icons.Zap className="w-5 h-5 text-white" />
        </div>
        {(!isCollapsed || isMobile) && (
          <span className="ml-3 font-bold text-lg text-white">OpenClaw</span>
        )}
        
        {/* Mobile close button */}
        {isMobile && onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="ml-auto p-2 text-dark-400 hover:text-white"
          >
            <Icons.X className="w-5 h-5" />
          </button>
        )}
        
        {/* Desktop collapse button */}
        {!isMobile && (
          <button
            onClick={onToggleCollapse}
            className="ml-auto p-1.5 text-dark-400 hover:text-white hover:bg-dark-800 rounded-lg transition-colors"
          >
            {isCollapsed ? (
              <Icons.ChevronRight className="w-4 h-4" />
            ) : (
              <Icons.ChevronLeft className="w-4 h-4" />
            )}
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          const showBadge = item.id === 'tasks' && taskCount > 0;
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 ${
                isActive
                  ? 'bg-primary-500/10 text-primary-400'
                  : 'text-dark-400 hover:text-dark-200 hover:bg-dark-800'
              }`}
            >
              <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-primary-400' : ''}`} />
              {(!isCollapsed || isMobile) && (
                <span className="font-medium flex-1 text-left">{item.label}</span>
              )}
              {showBadge && (!isCollapsed || isMobile) && (
                <span className="bg-primary-500 text-white text-xs font-medium px-2 py-0.5 rounded-full">
                  {taskCount > 99 ? '99+' : taskCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-dark-800">
        {(!isCollapsed || isMobile) ? (
          <div className="text-xs text-dark-500">
            <p>OpenClaw Dashboard</p>
            <p>v1.0.0</p>
          </div>
        ) : (
          <div className="flex justify-center">
            <span className="text-xs text-dark-500">v1</span>
          </div>
        )}
      </div>
    </aside>
  );
};
