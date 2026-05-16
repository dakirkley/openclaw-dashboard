# Activity Log Feature

This document describes the Activity Log feature for the OpenClaw Dashboard.

## Overview

The Activity Log provides a complete history of all changes and sync operations across your businesses. It tracks:

- **Sync operations** - When data is synchronized with Supabase
- **Add operations** - When new bots, skills, APIs, or businesses are created
- **Update operations** - When existing entities are modified
- **Delete operations** - When entities are removed

## Database Schema

### activity_log Table

```sql
CREATE TABLE activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('sync', 'add', 'update', 'delete')),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('bot', 'skill', 'api', 'business')),
  entity_name TEXT NOT NULL,
  details JSONB DEFAULT '{}',
  status TEXT NOT NULL CHECK (status IN ('success', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Indexes

- `idx_activity_log_business_id` - For filtering by business
- `idx_activity_log_created_at` - For sorting by date
- `idx_activity_log_action` - For filtering by action type
- `idx_activity_log_entity_type` - For filtering by entity type
- `idx_activity_log_status` - For filtering by status

## Components

### ActivityLogView.tsx
Main activity feed component with:
- Search functionality
- Filters (action type, entity type, status, date range)
- Grouped by date (Today, Yesterday, specific dates)
- Activity count summary

### ActivityItem.tsx
Individual activity row displaying:
- Action icon (sync, add, update, delete)
- Entity type icon (bot, skill, api, business)
- Entity name
- Details/description
- Timestamp (relative and absolute)
- Status indicator (success/failed)

### ActivityFilters.tsx
Filter panel with:
- Action filter dropdown
- Entity type filter dropdown
- Status filter dropdown
- Date range picker
- Active filter tags with quick removal

## Usage

### Viewing Activities

1. Navigate to **Activity Log** in the sidebar
2. Browse activities grouped by date
3. Use filters to narrow down results
4. Search for specific activities

### Logging Activities from Code

```typescript
import { useDashboardData } from './hooks/useDashboardData';

function MyComponent() {
  const { logActivity } = useDashboardData();
  
  const handleSomething = async () => {
    // Do something...
    
    // Log the activity
    await logActivity(
      businessId,
      'add',        // action: 'sync' | 'add' | 'update' | 'delete'
      'bot',        // entity_type: 'bot' | 'skill' | 'api' | 'business'
      'My New Bot', // entity_name
      { model: 'gpt-4' }, // details (optional)
      'success'     // status: 'success' | 'failed'
    );
  };
}
```

### Using the Sync Script

```bash
# Run the sync script with activity logging
node sync-with-activity-log.js "Your Business Name"
```

The sync script automatically logs:
- Business creation (if new)
- Skills added/updated
- Bots added
- APIs added
- Overall sync summary

## UI Features

### Icons by Action Type
- **Sync** - RefreshCw icon (blue)
- **Add** - Plus icon (green)
- **Update** - Edit2 icon (amber)
- **Delete** - Trash2 icon (red)
- **Failed** - XCircle icon (red)

### Icons by Entity Type
- **Bot** - Bot icon
- **Skill** - Puzzle icon
- **API** - Key icon
- **Business** - Building2 icon

### Timestamps
- Relative time for recent activities ("Just now", "5m ago", "2h ago")
- Absolute date for older activities
- Full timestamp on hover

## Setup

1. Run the SQL schema to create the activity_log table:
   ```bash
   # In Supabase SQL Editor, run:
   -- activity-log-schema.sql
   ```

2. The dashboard will automatically load activities on startup

3. Activities are displayed in reverse chronological order (newest first)

## Future Enhancements

Potential improvements:
- Export activity log to CSV/JSON
- Activity log retention policies
- Email notifications for failed operations
- Activity analytics and insights
- Real-time activity updates via WebSocket
