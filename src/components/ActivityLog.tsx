import React from 'react';
import * as Icons from './icons';

interface Activity {
  id: string;
  businessId: string;
  action: string;
  entityType: string;
  entityName: string;
  details: string;
  status: string;
  createdAt: string;
}

interface ActivityLogProps {
  activities: Activity[];
  businessId?: string;
}

export const ActivityLog: React.FC<ActivityLogProps> = ({ activities, businessId }) => {
  const filteredActivities = businessId 
    ? activities.filter(a => a.businessId === businessId)
    : activities;
  const getActionIcon = (action: string) => {
    switch (action) {
      case 'sync': return <Icons.RefreshCw className="w-4 h-4" />;
      case 'add': return <Icons.Plus className="w-4 h-4" />;
      case 'update': return <Icons.Edit2 className="w-4 h-4" />;
      case 'delete': return <Icons.Trash2 className="w-4 h-4" />;
      default: return <Icons.Activity className="w-4 h-4" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'sync': return 'text-blue-400 bg-blue-500/10';
      case 'add': return 'text-green-400 bg-green-500/10';
      case 'update': return 'text-yellow-400 bg-yellow-500/10';
      case 'delete': return 'text-red-400 bg-red-500/10';
      default: return 'text-dark-400 bg-dark-800';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white">Activity Log</h1>
        <p className="text-dark-400 mt-1">History of changes and syncs</p>
      </div>

      {filteredActivities.length === 0 ? (
        <div className="card text-center py-12">
          <Icons.Activity className="w-12 h-12 text-dark-600 mx-auto mb-3" />
          <p className="text-dark-400">No activity yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredActivities.map((activity) => (
            <div key={activity.id} className="card flex items-start gap-4">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${getActionColor(activity.action)}`}>
                {getActionIcon(activity.action)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-white capitalize">{activity.action}</span>
                  <span className="text-dark-500">{activity.entityType}</span>
                  {activity.entityName && (
                    <span className="text-primary-400">{activity.entityName}</span>
                  )}
                </div>
                {activity.details && (
                  <p className="text-sm text-dark-400 mt-1">{activity.details}</p>
                )}
                <div className="flex items-center gap-3 mt-2 text-xs text-dark-500">
                  <span className="flex items-center gap-1">
                    <Icons.Clock className="w-3 h-3" />
                    {new Date(activity.createdAt).toLocaleString()}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full ${activity.status === 'success' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                    {activity.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
