import type { DashboardData, BusinessData, Bot, SubAgent, Skill, ApiConfig, ApiKey } from '../types';

// API Service for handling REST API requests
// This works with the dashboard's localStorage data

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface ApiError {
  code: string;
  message: string;
}

// Get data from localStorage (same as dashboard)
function getDashboardData(): DashboardData {
  const stored = localStorage.getItem('openclaw-dashboard-v2');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error('Failed to parse stored data:', e);
    }
  }
  return { businesses: [], apiKeys: [], tasks: [], activities: [], memoryBanks: [] };
}

// Save data to localStorage
function saveDashboardData(data: DashboardData) {
  localStorage.setItem('openclaw-dashboard-v2', JSON.stringify(data));
}

// Validate API key
export function validateApiKey(key: string): ApiKey | null {
  const data = getDashboardData();
  const found = (data.apiKeys || []).find(k => k.key === key);
  if (found) {
    // Update last used
    const updated = {
      ...data,
      apiKeys: (data.apiKeys || []).map(k => 
        k.id === found.id ? { ...k, lastUsedAt: new Date().toISOString() } : k
      ),
    };
    saveDashboardData(updated);
    return found;
  }
  return null;
}

// Check permissions
function hasPermission(apiKey: ApiKey, permission: 'read' | 'write' | 'delete'): boolean {
  return apiKey.permissions.includes(permission);
}

// API Service class
export class ApiService {
  private _apiKey: string;
  private validatedKey: ApiKey | null = null;

  constructor(apiKey: string) {
    this._apiKey = apiKey;
    this.validatedKey = validateApiKey(apiKey);
    // Store for potential future use (logging, debugging, etc.)
    void this._apiKey;
  }

  isAuthenticated(): boolean {
    return this.validatedKey !== null;
  }

  getKeyInfo(): ApiKey | null {
    return this.validatedKey;
  }

  // ============ BUSINESSES ============

  getBusinesses(): ApiResponse<BusinessData[]> {
    if (!this.validatedKey || !hasPermission(this.validatedKey, 'read')) {
      return { success: false, error: 'Unauthorized' };
    }
    const data = getDashboardData();
    return { success: true, data: data.businesses };
  }

  getBusiness(businessId: string): ApiResponse<BusinessData> {
    if (!this.validatedKey || !hasPermission(this.validatedKey, 'read')) {
      return { success: false, error: 'Unauthorized' };
    }
    const data = getDashboardData();
    const business = data.businesses.find(b => b.business.id === businessId);
    if (!business) {
      return { success: false, error: 'Business not found' };
    }
    return { success: true, data: business };
  }

  createBusiness(businessData: Partial<BusinessData['business']>): ApiResponse<BusinessData> {
    if (!this.validatedKey || !hasPermission(this.validatedKey, 'write')) {
      return { success: false, error: 'Unauthorized' };
    }
    const data = getDashboardData();
    const newBusiness: BusinessData = {
      business: {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: businessData.name || 'New Business',
        description: businessData.description || '',
        endpointUrl: businessData.endpointUrl || '',
        apiKey: businessData.apiKey || '',
        color: businessData.color || '#0ea5e9',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      bots: [],
      subAgents: [],
      skills: [],
      apis: [],
    };
    data.businesses.push(newBusiness);
    saveDashboardData(data);
    return { success: true, data: newBusiness };
  }

  updateBusiness(businessId: string, updates: Partial<BusinessData['business']>): ApiResponse<BusinessData> {
    if (!this.validatedKey || !hasPermission(this.validatedKey, 'write')) {
      return { success: false, error: 'Unauthorized' };
    }
    const data = getDashboardData();
    const index = data.businesses.findIndex(b => b.business.id === businessId);
    if (index === -1) {
      return { success: false, error: 'Business not found' };
    }
    data.businesses[index].business = {
      ...data.businesses[index].business,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    saveDashboardData(data);
    return { success: true, data: data.businesses[index] };
  }

  deleteBusiness(businessId: string): ApiResponse<void> {
    if (!this.validatedKey || !hasPermission(this.validatedKey, 'delete')) {
      return { success: false, error: 'Unauthorized' };
    }
    const data = getDashboardData();
    data.businesses = data.businesses.filter(b => b.business.id !== businessId);
    saveDashboardData(data);
    return { success: true };
  }

  // ============ BOTS ============

  getBots(businessId: string): ApiResponse<Bot[]> {
    if (!this.validatedKey || !hasPermission(this.validatedKey, 'read')) {
      return { success: false, error: 'Unauthorized' };
    }
    const data = getDashboardData();
    const business = data.businesses.find(b => b.business.id === businessId);
    if (!business) {
      return { success: false, error: 'Business not found' };
    }
    return { success: true, data: business.bots };
  }

  createBot(businessId: string, botData: Partial<Bot>): ApiResponse<Bot> {
    if (!this.validatedKey || !hasPermission(this.validatedKey, 'write')) {
      return { success: false, error: 'Unauthorized' };
    }
    const data = getDashboardData();
    const business = data.businesses.find(b => b.business.id === businessId);
    if (!business) {
      return { success: false, error: 'Business not found' };
    }
    const newBot: Bot = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: botData.name || 'New Bot',
      model: botData.model || 'gpt-4',
      purpose: botData.purpose || '',
      status: botData.status || 'active',
      config: botData.config || {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    business.bots.push(newBot);
    saveDashboardData(data);
    return { success: true, data: newBot };
  }

  updateBot(businessId: string, botId: string, updates: Partial<Bot>): ApiResponse<Bot> {
    if (!this.validatedKey || !hasPermission(this.validatedKey, 'write')) {
      return { success: false, error: 'Unauthorized' };
    }
    const data = getDashboardData();
    const business = data.businesses.find(b => b.business.id === businessId);
    if (!business) {
      return { success: false, error: 'Business not found' };
    }
    const botIndex = business.bots.findIndex(b => b.id === botId);
    if (botIndex === -1) {
      return { success: false, error: 'Bot not found' };
    }
    business.bots[botIndex] = {
      ...business.bots[botIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    saveDashboardData(data);
    return { success: true, data: business.bots[botIndex] };
  }

  deleteBot(businessId: string, botId: string): ApiResponse<void> {
    if (!this.validatedKey || !hasPermission(this.validatedKey, 'delete')) {
      return { success: false, error: 'Unauthorized' };
    }
    const data = getDashboardData();
    const business = data.businesses.find(b => b.business.id === businessId);
    if (!business) {
      return { success: false, error: 'Business not found' };
    }
    business.bots = business.bots.filter(b => b.id !== botId);
    saveDashboardData(data);
    return { success: true };
  }

  // ============ SUB-AGENTS ============

  getSubAgents(businessId: string): ApiResponse<SubAgent[]> {
    if (!this.validatedKey || !hasPermission(this.validatedKey, 'read')) {
      return { success: false, error: 'Unauthorized' };
    }
    const data = getDashboardData();
    const business = data.businesses.find(b => b.business.id === businessId);
    if (!business) {
      return { success: false, error: 'Business not found' };
    }
    return { success: true, data: business.subAgents };
  }

  createSubAgent(businessId: string, agentData: Partial<SubAgent>): ApiResponse<SubAgent> {
    if (!this.validatedKey || !hasPermission(this.validatedKey, 'write')) {
      return { success: false, error: 'Unauthorized' };
    }
    const data = getDashboardData();
    const business = data.businesses.find(b => b.business.id === businessId);
    if (!business) {
      return { success: false, error: 'Business not found' };
    }
    const newAgent: SubAgent = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      botId: agentData.botId || '',
      name: agentData.name || 'New Agent',
      role: agentData.role || '',
      status: agentData.status || 'active',
      parentAgentId: agentData.parentAgentId,
      capabilities: agentData.capabilities || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    business.subAgents.push(newAgent);
    saveDashboardData(data);
    return { success: true, data: newAgent };
  }

  updateSubAgent(businessId: string, agentId: string, updates: Partial<SubAgent>): ApiResponse<SubAgent> {
    if (!this.validatedKey || !hasPermission(this.validatedKey, 'write')) {
      return { success: false, error: 'Unauthorized' };
    }
    const data = getDashboardData();
    const business = data.businesses.find(b => b.business.id === businessId);
    if (!business) {
      return { success: false, error: 'Business not found' };
    }
    const agentIndex = business.subAgents.findIndex(a => a.id === agentId);
    if (agentIndex === -1) {
      return { success: false, error: 'Sub-agent not found' };
    }
    business.subAgents[agentIndex] = {
      ...business.subAgents[agentIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    saveDashboardData(data);
    return { success: true, data: business.subAgents[agentIndex] };
  }

  deleteSubAgent(businessId: string, agentId: string): ApiResponse<void> {
    if (!this.validatedKey || !hasPermission(this.validatedKey, 'delete')) {
      return { success: false, error: 'Unauthorized' };
    }
    const data = getDashboardData();
    const business = data.businesses.find(b => b.business.id === businessId);
    if (!business) {
      return { success: false, error: 'Business not found' };
    }
    business.subAgents = business.subAgents.filter(a => a.id !== agentId);
    saveDashboardData(data);
    return { success: true };
  }

  // ============ SKILLS ============

  getSkills(businessId: string): ApiResponse<Skill[]> {
    if (!this.validatedKey || !hasPermission(this.validatedKey, 'read')) {
      return { success: false, error: 'Unauthorized' };
    }
    const data = getDashboardData();
    const business = data.businesses.find(b => b.business.id === businessId);
    if (!business) {
      return { success: false, error: 'Business not found' };
    }
    return { success: true, data: business.skills };
  }

  createSkill(businessId: string, skillData: Partial<Skill>): ApiResponse<Skill> {
    if (!this.validatedKey || !hasPermission(this.validatedKey, 'write')) {
      return { success: false, error: 'Unauthorized' };
    }
    const data = getDashboardData();
    const business = data.businesses.find(b => b.business.id === businessId);
    if (!business) {
      return { success: false, error: 'Business not found' };
    }
    const newSkill: Skill = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: skillData.name || 'New Skill',
      version: skillData.version || '1.0.0',
      description: skillData.description || '',
      commands: skillData.commands || [],
      category: skillData.category || 'Other',
      installedAt: new Date().toISOString(),
      usedByBots: skillData.usedByBots || [],
    };
    business.skills.push(newSkill);
    saveDashboardData(data);
    return { success: true, data: newSkill };
  }

  updateSkill(businessId: string, skillId: string, updates: Partial<Skill>): ApiResponse<Skill> {
    if (!this.validatedKey || !hasPermission(this.validatedKey, 'write')) {
      return { success: false, error: 'Unauthorized' };
    }
    const data = getDashboardData();
    const business = data.businesses.find(b => b.business.id === businessId);
    if (!business) {
      return { success: false, error: 'Business not found' };
    }
    const skillIndex = business.skills.findIndex(s => s.id === skillId);
    if (skillIndex === -1) {
      return { success: false, error: 'Skill not found' };
    }
    business.skills[skillIndex] = {
      ...business.skills[skillIndex],
      ...updates,
    };
    saveDashboardData(data);
    return { success: true, data: business.skills[skillIndex] };
  }

  deleteSkill(businessId: string, skillId: string): ApiResponse<void> {
    if (!this.validatedKey || !hasPermission(this.validatedKey, 'delete')) {
      return { success: false, error: 'Unauthorized' };
    }
    const data = getDashboardData();
    const business = data.businesses.find(b => b.business.id === businessId);
    if (!business) {
      return { success: false, error: 'Business not found' };
    }
    business.skills = business.skills.filter(s => s.id !== skillId);
    saveDashboardData(data);
    return { success: true };
  }

  // ============ APIs ============

  getApis(businessId: string): ApiResponse<ApiConfig[]> {
    if (!this.validatedKey || !hasPermission(this.validatedKey, 'read')) {
      return { success: false, error: 'Unauthorized' };
    }
    const data = getDashboardData();
    const business = data.businesses.find(b => b.business.id === businessId);
    if (!business) {
      return { success: false, error: 'Business not found' };
    }
    return { success: true, data: business.apis };
  }

  createApi(businessId: string, apiData: Partial<ApiConfig>): ApiResponse<ApiConfig> {
    if (!this.validatedKey || !hasPermission(this.validatedKey, 'write')) {
      return { success: false, error: 'Unauthorized' };
    }
    const data = getDashboardData();
    const business = data.businesses.find(b => b.business.id === businessId);
    if (!business) {
      return { success: false, error: 'Business not found' };
    }
    const newApi: ApiConfig = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: apiData.name || 'New API',
      provider: apiData.provider || 'Custom',
      keyMasked: apiData.keyMasked || '••••',
      status: apiData.status || 'active',
      lastChecked: new Date().toISOString(),
      usedBySkills: apiData.usedBySkills || [],
      usedByBots: apiData.usedByBots || [],
    };
    business.apis.push(newApi);
    saveDashboardData(data);
    return { success: true, data: newApi };
  }

  updateApi(businessId: string, apiId: string, updates: Partial<ApiConfig>): ApiResponse<ApiConfig> {
    if (!this.validatedKey || !hasPermission(this.validatedKey, 'write')) {
      return { success: false, error: 'Unauthorized' };
    }
    const data = getDashboardData();
    const business = data.businesses.find(b => b.business.id === businessId);
    if (!business) {
      return { success: false, error: 'Business not found' };
    }
    const apiIndex = business.apis.findIndex(a => a.id === apiId);
    if (apiIndex === -1) {
      return { success: false, error: 'API not found' };
    }
    business.apis[apiIndex] = {
      ...business.apis[apiIndex],
      ...updates,
    };
    saveDashboardData(data);
    return { success: true, data: business.apis[apiIndex] };
  }

  deleteApi(businessId: string, apiId: string): ApiResponse<void> {
    if (!this.validatedKey || !hasPermission(this.validatedKey, 'delete')) {
      return { success: false, error: 'Unauthorized' };
    }
    const data = getDashboardData();
    const business = data.businesses.find(b => b.business.id === businessId);
    if (!business) {
      return { success: false, error: 'Business not found' };
    }
    business.apis = business.apis.filter(a => a.id !== apiId);
    saveDashboardData(data);
    return { success: true };
  }
}

// Export singleton for direct use
export const apiService = {
  validateApiKey,
  createService: (apiKey: string) => new ApiService(apiKey),
};

export default ApiService;
