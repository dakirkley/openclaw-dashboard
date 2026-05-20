export interface Business {
  id: string;
  name: string;
  description: string;
  endpointUrl: string;
  apiKey: string;
  color: string;
  createdAt: string;
  updatedAt: string;
}

export interface Bot {
  id: string;
  name: string;
  status: 'active' | 'inactive' | 'error';
  model: string;
  purpose: string;
  config: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface SubAgent {
  id: string;
  botId: string;
  name: string;
  role: string;
  status: 'active' | 'inactive' | 'idle';
  parentAgentId?: string;
  capabilities: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Skill {
  id: string;
  name: string;
  version: string;
  description: string;
  commands: string[];
  category: string;
  installedAt: string;
  usedByBots: string[];
}

export interface ApiConfig {
  id: string;
  name: string;
  provider: string;
  keyMasked: string;
  status: 'active' | 'expired' | 'unknown';
  lastChecked: string;
  usedBySkills: string[];
  usedByBots: string[];
}

// Each business has its own isolated data
export interface BusinessData {
  business: Business;
  bots: Bot[];
  subAgents: SubAgent[];
  skills: Skill[];
  apis: ApiConfig[];
}

// API Key for external access
export interface ApiKey {
  id: string;
  name: string;
  key: string;
  permissions: ('read' | 'write' | 'delete')[];
  createdAt: string;
  lastUsedAt?: string;
}

// Overall dashboard just has a list of businesses, each with their own data
export interface DashboardData {
  businesses: BusinessData[];
  apiKeys: ApiKey[];
  tasks: Task[];
  activities: Activity[];
  memoryBanks: MemoryBank[];
}

export interface Activity {
  id: string;
  businessId: string;
  action: string;
  entityType: string;
  entityName: string;
  details: string;
  status: string;
  createdAt: string;
}

export interface Task {
  id: string;
  businessId: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  dueDate?: string;
}

export interface MemoryBank {
  id: string;
  businessId: string;
  filename: string;
  title: string;
  category: string;
  contentPreview: string;
  content: string;
  lastUpdated: string;
  filePath: string;
  createdAt: string;
}

export interface Machine {
  id: string;
  name: string;
  nodeId: string;
  version: string;
  platform: string;
  businessId?: string;
  businessName?: string;
  skills: Skill[];
  lastSyncAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type View = 'dashboard' | 'businesses' | 'business-detail' | 'machines' | 'settings' | 'activity-log' | 'tasks' | 'memory-bank' | 'memory-bank-detail';

export const BUSINESS_COLORS = [
  { name: 'Blue', value: '#0ea5e9' },
  { name: 'Purple', value: '#8b5cf6' },
  { name: 'Green', value: '#10b981' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Cyan', value: '#06b6d4' },
  { name: 'Red', value: '#ef4444' },
  { name: 'Yellow', value: '#eab308' },
];

export const SKILL_CATEGORIES = [
  'AI/ML',
  'Communication',
  'Data',
  'Development',
  'Integration',
  'Media',
  'Productivity',
  'Search',
  'Security',
  'Other',
];

export const API_PROVIDERS = [
  'OpenAI',
  'Anthropic',
  'Google',
  'Brave',
  'ElevenLabs',
  'Vercel',
  'GitHub',
  'Custom',
];

export const BOT_MODELS = [
  'gpt-4',
  'gpt-4-turbo',
  'gpt-3.5-turbo',
  'claude-3-opus',
  'claude-3-sonnet',
  'claude-3-haiku',
  'gemini-pro',
  'gemini-ultra',
  'local-llama',
  'custom',
];
