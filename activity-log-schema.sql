-- Activity Log table for OpenClaw Dashboard
-- Add this to your Supabase SQL Editor

-- Activity Log table
CREATE TABLE IF NOT EXISTS activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('sync', 'add', 'update', 'delete')),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('bot', 'skill', 'api', 'business')),
  entity_name TEXT NOT NULL,
  details JSONB DEFAULT '{}',
  status TEXT NOT NULL CHECK (status IN ('success', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_activity_log_business_id ON activity_log(business_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_created_at ON activity_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_log_action ON activity_log(action);
CREATE INDEX IF NOT EXISTS idx_activity_log_entity_type ON activity_log(entity_type);
CREATE INDEX IF NOT EXISTS idx_activity_log_status ON activity_log(status);

-- Enable Row Level Security
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (you can restrict later)
CREATE POLICY IF NOT EXISTS "Allow all" ON activity_log FOR ALL USING (true);

-- Success message
SELECT 'Activity Log table created successfully!' as status;
