import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { BusinessesView } from './components/BusinessesView';
import { BusinessDetailView } from './components/BusinessDetailView';
import { SettingsView } from './components/SettingsView';
import { ActivityLog } from './components/ActivityLog';
import { TaskList } from './components/TaskList';
import { MemoryBankList } from './components/MemoryBankList';
import { MachinesView } from './components/MachinesView';
import { useDashboardData } from './hooks/useDashboardData';
import type { View, BusinessData } from './types';
import * as Icons from './components/icons';

function App() {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [selectedBusiness, setSelectedBusiness] = useState<BusinessData | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile screen
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const {
    data,
    stats,
    isLoaded,
    error,
    addBusiness,
    updateBusiness,
    deleteBusiness,
    addBot,
    updateBot,
    deleteBot,
    addSubAgent,
    updateSubAgent,
    deleteSubAgent,
    addSkill,
    updateSkill,
    deleteSkill,
    addApi,
    updateApi,
    deleteApi,
    exportData,
    importData,
    addApiKey,
    deleteApiKey,
    addTask,
  } = useDashboardData();

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-dark-400">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center p-4">
        <div className="text-center">
          <Icons.AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Error Loading Data</h2>
          <p className="text-dark-400">{error}</p>
        </div>
      </div>
    );
  }

  const handleViewChange = (view: string) => {
    setCurrentView(view as View);
    setIsMobileMenuOpen(false);
    // Only clear selected business when navigating away from business context
    const businessViews = ['business-detail', 'activity-log', 'tasks', 'memory-bank'];
    if (!businessViews.includes(view)) {
      setSelectedBusiness(null);
    }
  };

  const handleBusinessSelect = (businessData: BusinessData) => {
    setSelectedBusiness(businessData);
    setCurrentView('business-detail');
    setIsMobileMenuOpen(false);
  };

  const handleBackToBusinesses = () => {
    setSelectedBusiness(null);
    setCurrentView('businesses');
  };

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <DashboardView 
            data={data} 
            stats={stats} 
            onViewChange={handleViewChange} 
            onBusinessSelect={handleBusinessSelect}
          />
        );
      case 'businesses':
        return (
          <BusinessesView
            businesses={data.businesses}
            onAdd={addBusiness}
            onUpdate={updateBusiness}
            onDelete={deleteBusiness}
            onSelect={handleBusinessSelect}
          />
        );
      case 'business-detail':
        if (!selectedBusiness) return null;
        return (
          <BusinessDetailView
            businessData={selectedBusiness}
            onBack={handleBackToBusinesses}
            onAddBot={addBot}
            onUpdateBot={updateBot}
            onDeleteBot={deleteBot}
            onAddSubAgent={addSubAgent}
            onUpdateSubAgent={updateSubAgent}
            onDeleteSubAgent={deleteSubAgent}
            onAddSkill={addSkill}
            onUpdateSkill={updateSkill}
            onDeleteSkill={deleteSkill}
            onAddApi={addApi}
            onUpdateApi={updateApi}
            onDeleteApi={deleteApi}
          />
        );
      case 'activity-log':
        return (
          <ActivityLog 
            activities={data.activities || []} 
            businessId={selectedBusiness?.business.id}
          />
        );
      case 'tasks':
        return (
          <TaskList 
            tasks={data.tasks || []} 
            businessId={selectedBusiness?.business.id}
            onAddTask={addTask}
          />
        );
      case 'memory-bank':
        return (
          <MemoryBankList 
            memoryBanks={data.memoryBanks || []} 
            businessId={selectedBusiness?.business.id}
          />
        );
      case 'machines':
        return <MachinesView />;
      case 'settings':
        return (
          <SettingsView 
            onExport={exportData} 
            onImport={importData}
            apiKeys={data.apiKeys || []}
            onAddApiKey={addApiKey}
            onDeleteApiKey={deleteApiKey}
          />
        );
      default:
        return (
          <DashboardView 
            data={data} 
            stats={stats} 
            onViewChange={handleViewChange} 
            onBusinessSelect={handleBusinessSelect}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-dark-950 flex">
      {/* Mobile Menu Overlay */}
      {isMobile && isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        ${isMobile ? 'fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out' : 'relative'}
        ${isMobile && !isMobileMenuOpen ? '-translate-x-full' : 'translate-x-0'}
      `}>
        <Sidebar
          currentView={currentView}
          onViewChange={handleViewChange}
          isCollapsed={isSidebarCollapsed && !isMobile}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          isMobile={isMobile}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
        />
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-auto min-w-0">
        {/* Mobile Header */}
        {isMobile && (
          <div className="sticky top-0 z-30 bg-dark-950/95 backdrop-blur-sm border-b border-dark-800 px-4 py-3 flex items-center justify-between">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 text-dark-400 hover:text-white hover:bg-dark-800 rounded-lg transition-colors"
            >
              <Icons.Menu className="w-6 h-6" />
            </button>
            <h1 className="text-lg font-semibold text-white">OpenClaw Dashboard</h1>
            <div className="w-10" />
          </div>
        )}

        {/* Content */}
        <div className={`${isMobile ? 'p-4' : 'p-6'} max-w-7xl mx-auto`}>
          {renderView()}
        </div>
      </main>
    </div>
  );
}

export default App;
