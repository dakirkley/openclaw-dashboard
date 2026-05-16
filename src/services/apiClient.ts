const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';
const API_KEY = import.meta.env.VITE_API_KEY || '';

class ApiClient {
  private async request(method: string, endpoint: string, body: any = null): Promise<any> {
    const url = `${API_URL}${endpoint}`;
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      }
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'API request failed');
    }

    return data;
  }

  // Businesses
  async getBusinesses(): Promise<any> {
    return this.request('GET', '/businesses');
  }

  async getBusiness(id: string): Promise<any> {
    return this.request('GET', `/businesses/${id}`);
  }

  async createBusiness(business: any): Promise<any> {
    return this.request('POST', '/businesses', business);
  }

  async updateBusiness(id: string, updates: any): Promise<any> {
    return this.request('PUT', `/businesses/${id}`, updates);
  }

  async deleteBusiness(id: string): Promise<any> {
    return this.request('DELETE', `/businesses/${id}`);
  }

  // Bots
  async getBots(businessId: string): Promise<any> {
    return this.request('GET', `/businesses/${businessId}/bots`);
  }

  async createBot(businessId: string, bot: any): Promise<any> {
    return this.request('POST', `/businesses/${businessId}/bots`, bot);
  }

  async updateBot(businessId: string, botId: string, updates: any): Promise<any> {
    return this.request('PUT', `/businesses/${businessId}/bots/${botId}`, updates);
  }

  async deleteBot(businessId: string, botId: string): Promise<any> {
    return this.request('DELETE', `/businesses/${businessId}/bots/${botId}`);
  }

  // Sub-agents
  async getSubAgents(businessId: string): Promise<any> {
    return this.request('GET', `/businesses/${businessId}/subagents`);
  }

  async createSubAgent(businessId: string, agent: any): Promise<any> {
    return this.request('POST', `/businesses/${businessId}/subagents`, agent);
  }

  async updateSubAgent(businessId: string, agentId: string, updates: any): Promise<any> {
    return this.request('PUT', `/businesses/${businessId}/subagents/${agentId}`, updates);
  }

  async deleteSubAgent(businessId: string, agentId: string): Promise<any> {
    return this.request('DELETE', `/businesses/${businessId}/subagents/${agentId}`);
  }

  // Skills
  async getSkills(businessId: string): Promise<any> {
    return this.request('GET', `/businesses/${businessId}/skills`);
  }

  async createSkill(businessId: string, skill: any): Promise<any> {
    return this.request('POST', `/businesses/${businessId}/skills`, skill);
  }

  async updateSkill(businessId: string, skillId: string, updates: any): Promise<any> {
    return this.request('PUT', `/businesses/${businessId}/skills/${skillId}`, updates);
  }

  async deleteSkill(businessId: string, skillId: string): Promise<any> {
    return this.request('DELETE', `/businesses/${businessId}/skills/${skillId}`);
  }

  // APIs
  async getApis(businessId: string): Promise<any> {
    return this.request('GET', `/businesses/${businessId}/apis`);
  }

  async createApi(businessId: string, api: any): Promise<any> {
    return this.request('POST', `/businesses/${businessId}/apis`, api);
  }

  async updateApi(businessId: string, apiId: string, updates: any): Promise<any> {
    return this.request('PUT', `/businesses/${businessId}/apis/${apiId}`, updates);
  }

  async deleteApi(businessId: string, apiId: string): Promise<any> {
    return this.request('DELETE', `/businesses/${businessId}/apis/${apiId}`);
  }

  // API Keys
  async getApiKeys(): Promise<any> {
    return this.request('GET', '/apikeys');
  }

  async createApiKey(name: string, permissions: string[]): Promise<any> {
    return this.request('POST', '/apikeys', { name, permissions } as any);
  }

  async deleteApiKey(id: string): Promise<any> {
    return this.request('DELETE', `/apikeys/${id}`);
  }

  // Tasks
  async getTasks(): Promise<any> {
    return this.request('GET', '/tasks');
  }

  async createTask(task: any): Promise<any> {
    return this.request('POST', '/tasks', task);
  }

  async updateTask(id: string, updates: any): Promise<any> {
    return this.request('PUT', `/tasks/${id}`, updates);
  }

  async deleteTask(id: string): Promise<any> {
    return this.request('DELETE', `/tasks/${id}`);
  }

  // Memory Banks
  async getMemoryBanks(): Promise<any> {
    return this.request('GET', '/memory_banks');
  }

  async createMemoryBank(memoryBank: any): Promise<any> {
    return this.request('POST', '/memory_banks', memoryBank);
  }

  async updateMemoryBank(id: string, updates: any): Promise<any> {
    return this.request('PUT', `/memory_banks/${id}`, updates);
  }

  async deleteMemoryBank(id: string): Promise<any> {
    return this.request('DELETE', `/memory_banks/${id}`);
  }
}

export const apiClient = new ApiClient();
export default apiClient;
