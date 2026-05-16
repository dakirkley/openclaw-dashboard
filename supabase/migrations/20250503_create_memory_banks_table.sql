-- Create memory_banks table
CREATE TABLE IF NOT EXISTS memory_banks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE SET NULL,
  filename TEXT NOT NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  content_preview TEXT,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  file_path TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_memory_banks_business_id ON memory_banks(business_id);
CREATE INDEX IF NOT EXISTS idx_memory_banks_category ON memory_banks(category);
CREATE INDEX IF NOT EXISTS idx_memory_banks_last_updated ON memory_banks(last_updated);

-- Enable Row Level Security
ALTER TABLE memory_banks ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (adjust based on your auth setup)
CREATE POLICY "Allow all operations on memory_banks" ON memory_banks
  FOR ALL USING (true) WITH CHECK (true);

-- Create trigger to automatically update last_updated
DROP TRIGGER IF EXISTS update_memory_banks_last_updated ON memory_banks;
CREATE TRIGGER update_memory_banks_last_updated
  BEFORE UPDATE ON memory_banks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
