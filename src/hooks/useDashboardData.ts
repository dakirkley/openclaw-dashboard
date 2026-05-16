import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabase';
import type { DashboardData, Business, Bot, SubAgent, Skill, ApiConfig, Activity, Task, MemoryBank } from '../types';

export function useDashboardData() {
  const [data, setData] = useState<DashboardData>({ businesses: [], apiKeys: [], tasks: [], activities: [], memoryBanks: [] });
  const [memoryBanks, setMemoryBanks] = useState<MemoryBank[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load data from Supabase
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load businesses with related data
        const { data: businessesData, error: businessesError } = await supabase
          .from('businesses')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (businessesError) throw businessesError;
        
        // Load all related data for each business
        const businessesWithData: any[] = [];
        
        for (const business of businessesData || []) {
          const [botsRes, subAgentsRes, skillsRes, apisRes] = await Promise.all([
            supabase.from('bots').select('*').eq('business_id', business.id),
            supabase.from('sub_agents').select('*').eq('business_id', business.id),
            supabase.from('skills').select('*').eq('business_id', business.id),
            supabase.from('apis').select('*').eq('business_id', business.id)
          ]);
          
          businessesWithData.push({
            business: {
              id: business.id,
              name: business.name,
              description: business.description,
              endpointUrl: business.endpoint_url,
              apiKey: '',
              color: business.color,
              createdAt: business.created_at,
              updatedAt: business.updated_at
            },
            bots: botsRes.data?.map((b: any) => ({
              id: b.id,
              name: b.name,
              model: b.model,
              purpose: b.purpose,
              status: b.status,
              config: b.config,
              createdAt: b.created_at,
              updatedAt: b.updated_at
            })) || [],
            subAgents: subAgentsRes.data?.map((a: any) => ({
              id: a.id,
              botId: a.bot_id,
              name: a.name,
              role: a.role,
              status: a.status,
              capabilities: a.capabilities || [],
              parentAgentId: a.parent_agent_id,
              createdAt: a.created_at,
              updatedAt: a.updated_at
            })) || [],
            skills: skillsRes.data?.map((s: any) => ({
              id: s.id,
              name: s.name,
              version: s.version,
              description: s.description,
              commands: s.commands || [],
              category: s.category,
              installedAt: s.installed_at,
              usedByBots: s.used_by_bots || []
            })) || [],
            apis: apisRes.data?.map((a: any) => ({
              id: a.id,
              name: a.name,
              provider: a.provider,
              keyMasked: a.key_masked,
              status: a.status,
              lastChecked: a.last_checked,
              usedBySkills: a.used_by_skills || [],
              usedByBots: a.used_by_bots || []
            })) || []
          });
        }
        
        // Load API keys
        const { data: apiKeysData, error: apiKeysError } = await supabase
          .from('api_keys')
          .select('id, name, permissions, created_at, last_used_at')
          .order('created_at', { ascending: false });

        if (apiKeysError) throw apiKeysError;

        // Load memory banks
        const { data: memoryBanksData, error: memoryBanksError } = await supabase
          .from('memory_banks')
          .select('*')
          .order('last_updated', { ascending: false });

        if (memoryBanksError) {
          console.warn('Memory banks table may not exist yet:', memoryBanksError);
        }

        // Load tasks
        const { data: tasksData, error: tasksError } = await supabase
          .from('tasks')
          .select('*')
          .order('created_at', { ascending: false });

        if (tasksError) {
          console.warn('Tasks table may not exist yet:', tasksError);
        }

        // Load activities
        const { data: activitiesData, error: activitiesError } = await supabase
          .from('activity_log')
          .select('*')
          .order('created_at', { ascending: false });

        if (activitiesError) {
          console.warn('Activity log table may not exist yet:', activitiesError);
        }

        setData({
          businesses: businessesWithData,
          apiKeys: apiKeysData?.map((k: any) => ({
            id: k.id,
            name: k.name,
            key: '', // Don't expose full keys
            permissions: k.permissions,
            createdAt: k.created_at,
            lastUsedAt: k.last_used_at
          })) || [],
          tasks: tasksData?.map((t: any) => ({
            id: t.id,
            businessId: t.business_id,
            title: t.title,
            description: t.description || '',
            status: t.status,
            priority: t.priority,
            createdAt: t.created_at,
            updatedAt: t.updated_at,
            completedAt: t.completed_at,
            dueDate: t.due_date
          })) || [],
          activities: activitiesData?.map((a: any) => ({
            id: a.id,
            businessId: a.business_id,
            action: a.action,
            entityType: a.entity_type,
            entityName: a.entity_name,
            details: a.details,
            status: a.status,
            createdAt: a.created_at
          })) || [],
          memoryBanks: memoryBanksData?.map((mb: any) => ({
            id: mb.id,
            businessId: mb.business_id,
            filename: mb.filename,
            title: mb.title,
            category: mb.category,
            contentPreview: mb.content_preview,
            content: mb.content,
            lastUpdated: mb.last_updated,
            filePath: mb.file_path,
            createdAt: mb.created_at
          })) || []
        });
        
        setError(null);
      } catch (err) {
        console.error('Failed to load data from Supabase:', err);
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setIsLoaded(true);
      }
    };
    
    loadData();
    
    // Subscribe to real-time changes
    const subscription = supabase
      .channel('dashboard_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'businesses' }, () => {
        loadData();
      })
      .subscribe();
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Business operations
  const addBusiness = useCallback(async (business: Omit<Business, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const { data: newBusiness, error } = await supabase
        .from('businesses')
        .insert({
          name: business.name,
          description: business.description,
          endpoint_url: business.endpointUrl,
          color: business.color
        })
        .select()
        .single();
      
      if (error) throw error;
      
      const businessData: any = {
        business: {
          id: newBusiness.id,
          name: newBusiness.name,
          description: newBusiness.description,
          endpointUrl: newBusiness.endpoint_url,
          apiKey: '',
          color: newBusiness.color,
          createdAt: newBusiness.created_at,
          updatedAt: newBusiness.updated_at
        },
        bots: [],
        subAgents: [],
        skills: [],
        apis: []
      };
      
      setData(prev => ({
        ...prev,
        businesses: [...prev.businesses, businessData]
      }));
      
      return newBusiness.id;
    } catch (err) {
      console.error('Failed to add business:', err);
      throw err;
    }
  }, []);

  const updateBusiness = useCallback(async (businessId: string, updates: Partial<Business>) => {
    try {
      const updateData: any = {};
      if (updates.name) updateData.name = updates.name;
      if (updates.description) updateData.description = updates.description;
      if (updates.endpointUrl) updateData.endpoint_url = updates.endpointUrl;
      if (updates.color) updateData.color = updates.color;
      updateData.updated_at = new Date().toISOString();
      
      const { error } = await supabase
        .from('businesses')
        .update(updateData)
        .eq('id', businessId);
      
      if (error) throw error;
      
      setData(prev => ({
        ...prev,
        businesses: prev.businesses.map(bd =>
          bd.business.id === businessId
            ? { ...bd, business: { ...bd.business, ...updates, updatedAt: new Date().toISOString() } }
            : bd
        )
      }));
    } catch (err) {
      console.error('Failed to update business:', err);
      throw err;
    }
  }, []);

  const deleteBusiness = useCallback(async (businessId: string) => {
    try {
      const { error } = await supabase
        .from('businesses')
        .delete()
        .eq('id', businessId);
      
      if (error) throw error;
      
      setData(prev => ({
        ...prev,
        businesses: prev.businesses.filter(bd => bd.business.id !== businessId)
      }));
    } catch (err) {
      console.error('Failed to delete business:', err);
      throw err;
    }
  }, []);

  // Bot operations
  const addBot = useCallback(async (businessId: string, bot: Omit<Bot, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const { data: newBot, error } = await supabase
        .from('bots')
        .insert({
          business_id: businessId,
          name: bot.name,
          model: bot.model,
          purpose: bot.purpose,
          status: bot.status,
          config: bot.config
        })
        .select()
        .single();
      
      if (error) throw error;
      
      const botData: Bot = {
        id: newBot.id,
        name: newBot.name,
        model: newBot.model,
        purpose: newBot.purpose,
        status: newBot.status,
        config: newBot.config,
        createdAt: newBot.created_at,
        updatedAt: newBot.updated_at
      };
      
      setData(prev => ({
        ...prev,
        businesses: prev.businesses.map(bd =>
          bd.business.id === businessId
            ? { ...bd, bots: [...bd.bots, botData] }
            : bd
        )
      }));
      
      return newBot.id;
    } catch (err) {
      console.error('Failed to add bot:', err);
      throw err;
    }
  }, []);

  const updateBot = useCallback(async (businessId: string, botId: string, updates: Partial<Bot>) => {
    try {
      const updateData: any = { ...updates, updated_at: new Date().toISOString() };
      
      const { error } = await supabase
        .from('bots')
        .update(updateData)
        .eq('id', botId);
      
      if (error) throw error;
      
      setData(prev => ({
        ...prev,
        businesses: prev.businesses.map(bd =>
          bd.business.id === businessId
            ? { ...bd, bots: bd.bots.map(b => b.id === botId ? { ...b, ...updates, updatedAt: new Date().toISOString() } : b) }
            : bd
        )
      }));
    } catch (err) {
      console.error('Failed to update bot:', err);
      throw err;
    }
  }, []);

  const deleteBot = useCallback(async (businessId: string, botId: string) => {
    try {
      const { error } = await supabase
        .from('bots')
        .delete()
        .eq('id', botId);
      
      if (error) throw error;
      
      setData(prev => ({
        ...prev,
        businesses: prev.businesses.map(bd =>
          bd.business.id === businessId
            ? { ...bd, bots: bd.bots.filter(b => b.id !== botId) }
            : bd
        )
      }));
    } catch (err) {
      console.error('Failed to delete bot:', err);
      throw err;
    }
  }, []);

  // SubAgent operations
  const addSubAgent = useCallback(async (businessId: string, agent: Omit<SubAgent, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const { data: newAgent, error } = await supabase
        .from('sub_agents')
        .insert({
          business_id: businessId,
          bot_id: agent.botId,
          name: agent.name,
          role: agent.role,
          status: agent.status,
          capabilities: agent.capabilities,
          parent_agent_id: agent.parentAgentId
        })
        .select()
        .single();
      
      if (error) throw error;
      
      const agentData: SubAgent = {
        id: newAgent.id,
        botId: newAgent.bot_id,
        name: newAgent.name,
        role: newAgent.role,
        status: newAgent.status,
        capabilities: newAgent.capabilities || [],
        parentAgentId: newAgent.parent_agent_id,
        createdAt: newAgent.created_at,
        updatedAt: newAgent.updated_at
      };
      
      setData(prev => ({
        ...prev,
        businesses: prev.businesses.map(bd =>
          bd.business.id === businessId
            ? { ...bd, subAgents: [...bd.subAgents, agentData] }
            : bd
        )
      }));
      
      return newAgent.id;
    } catch (err) {
      console.error('Failed to add sub-agent:', err);
      throw err;
    }
  }, []);

  const updateSubAgent = useCallback(async (businessId: string, agentId: string, updates: Partial<SubAgent>) => {
    try {
      const updateData: any = { ...updates, updated_at: new Date().toISOString() };
      if (updates.botId) updateData.bot_id = updates.botId;
      if (updates.parentAgentId) updateData.parent_agent_id = updates.parentAgentId;
      
      const { error } = await supabase
        .from('sub_agents')
        .update(updateData)
        .eq('id', agentId);
      
      if (error) throw error;
      
      setData(prev => ({
        ...prev,
        businesses: prev.businesses.map(bd =>
          bd.business.id === businessId
            ? { ...bd, subAgents: bd.subAgents.map(a => a.id === agentId ? { ...a, ...updates, updatedAt: new Date().toISOString() } : a) }
            : bd
        )
      }));
    } catch (err) {
      console.error('Failed to update sub-agent:', err);
      throw err;
    }
  }, []);

  const deleteSubAgent = useCallback(async (businessId: string, agentId: string) => {
    try {
      const { error } = await supabase
        .from('sub_agents')
        .delete()
        .eq('id', agentId);
      
      if (error) throw error;
      
      setData(prev => ({
        ...prev,
        businesses: prev.businesses.map(bd =>
          bd.business.id === businessId
            ? { ...bd, subAgents: bd.subAgents.filter(a => a.id !== agentId) }
            : bd
        )
      }));
    } catch (err) {
      console.error('Failed to delete sub-agent:', err);
      throw err;
    }
  }, []);

  // Skill operations
  const addSkill = useCallback(async (businessId: string, skill: Omit<Skill, 'id'>) => {
    try {
      const { data: newSkill, error } = await supabase
        .from('skills')
        .insert({
          business_id: businessId,
          name: skill.name,
          version: skill.version,
          description: skill.description,
          commands: skill.commands,
          category: skill.category,
          used_by_bots: skill.usedByBots
        })
        .select()
        .single();
      
      if (error) throw error;
      
      const skillData: Skill = {
        id: newSkill.id,
        name: newSkill.name,
        version: newSkill.version,
        description: newSkill.description,
        commands: newSkill.commands || [],
        category: newSkill.category,
        installedAt: newSkill.installed_at,
        usedByBots: newSkill.used_by_bots || []
      };
      
      setData(prev => ({
        ...prev,
        businesses: prev.businesses.map(bd =>
          bd.business.id === businessId
            ? { ...bd, skills: [...bd.skills, skillData] }
            : bd
        )
      }));
      
      return newSkill.id;
    } catch (err) {
      console.error('Failed to add skill:', err);
      throw err;
    }
  }, []);

  const updateSkill = useCallback(async (businessId: string, skillId: string, updates: Partial<Skill>) => {
    try {
      const updateData: any = { ...updates };
      if (updates.usedByBots) updateData.used_by_bots = updates.usedByBots;
      
      const { error } = await supabase
        .from('skills')
        .update(updateData)
        .eq('id', skillId);
      
      if (error) throw error;
      
      setData(prev => ({
        ...prev,
        businesses: prev.businesses.map(bd =>
          bd.business.id === businessId
            ? { ...bd, skills: bd.skills.map(s => s.id === skillId ? { ...s, ...updates } : s) }
            : bd
        )
      }));
    } catch (err) {
      console.error('Failed to update skill:', err);
      throw err;
    }
  }, []);

  const deleteSkill = useCallback(async (businessId: string, skillId: string) => {
    try {
      const { error } = await supabase
        .from('skills')
        .delete()
        .eq('id', skillId);
      
      if (error) throw error;
      
      setData(prev => ({
        ...prev,
        businesses: prev.businesses.map(bd =>
          bd.business.id === businessId
            ? { ...bd, skills: bd.skills.filter(s => s.id !== skillId) }
            : bd
        )
      }));
    } catch (err) {
      console.error('Failed to delete skill:', err);
      throw err;
    }
  }, []);

  // API operations
  const addApi = useCallback(async (businessId: string, api: Omit<ApiConfig, 'id'>) => {
    try {
      const { data: newApi, error } = await supabase
        .from('apis')
        .insert({
          business_id: businessId,
          name: api.name,
          provider: api.provider,
          key_masked: api.keyMasked,
          status: api.status,
          used_by_skills: api.usedBySkills,
          used_by_bots: api.usedByBots
        })
        .select()
        .single();
      
      if (error) throw error;
      
      const apiData: ApiConfig = {
        id: newApi.id,
        name: newApi.name,
        provider: newApi.provider,
        keyMasked: newApi.key_masked,
        status: newApi.status,
        lastChecked: newApi.last_checked,
        usedBySkills: newApi.used_by_skills || [],
        usedByBots: newApi.used_by_bots || []
      };
      
      setData(prev => ({
        ...prev,
        businesses: prev.businesses.map(bd =>
          bd.business.id === businessId
            ? { ...bd, apis: [...bd.apis, apiData] }
            : bd
        )
      }));
      
      return newApi.id;
    } catch (err) {
      console.error('Failed to add API:', err);
      throw err;
    }
  }, []);

  const updateApi = useCallback(async (businessId: string, apiId: string, updates: Partial<ApiConfig>) => {
    try {
      const updateData: any = { ...updates };
      if (updates.usedBySkills) updateData.used_by_skills = updates.usedBySkills;
      if (updates.usedByBots) updateData.used_by_bots = updates.usedByBots;
      if (updates.lastChecked) updateData.last_checked = updates.lastChecked;
      
      const { error } = await supabase
        .from('apis')
        .update(updateData)
        .eq('id', apiId);
      
      if (error) throw error;
      
      setData(prev => ({
        ...prev,
        businesses: prev.businesses.map(bd =>
          bd.business.id === businessId
            ? { ...bd, apis: bd.apis.map(a => a.id === apiId ? { ...a, ...updates } : a) }
            : bd
        )
      }));
    } catch (err) {
      console.error('Failed to update API:', err);
      throw err;
    }
  }, []);

  const deleteApi = useCallback(async (businessId: string, apiId: string) => {
    try {
      const { error } = await supabase
        .from('apis')
        .delete()
        .eq('id', apiId);
      
      if (error) throw error;
      
      setData(prev => ({
        ...prev,
        businesses: prev.businesses.map(bd =>
          bd.business.id === businessId
            ? { ...bd, apis: bd.apis.filter(a => a.id !== apiId) }
            : bd
        )
      }));
    } catch (err) {
      console.error('Failed to delete API:', err);
      throw err;
    }
  }, []);

  // API Key operations
  const addApiKey = useCallback(async (name: string, permissions: ('read' | 'write' | 'delete')[]) => {
    try {
      // Generate a key
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      let key = 'oc_';
      for (let i = 0; i < 32; i++) {
        key += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      
      const { data: newKey, error } = await supabase
        .from('api_keys')
        .insert({ name, key, permissions })
        .select()
        .single();
      
      if (error) throw error;
      
      const keyData = {
        id: newKey.id,
        name: newKey.name,
        key: newKey.key,
        permissions: newKey.permissions,
        createdAt: newKey.created_at,
        lastUsedAt: newKey.last_used_at
      };
      
      setData(prev => ({
        ...prev,
        apiKeys: [...prev.apiKeys, keyData]
      }));
      
      return keyData;
    } catch (err) {
      console.error('Failed to add API key:', err);
      throw err;
    }
  }, []);

  const deleteApiKey = useCallback(async (keyId: string) => {
    try {
      const { error } = await supabase
        .from('api_keys')
        .delete()
        .eq('id', keyId);
      
      if (error) throw error;
      
      setData(prev => ({
        ...prev,
        apiKeys: prev.apiKeys.filter(k => k.id !== keyId)
      }));
    } catch (err) {
      console.error('Failed to delete API key:', err);
      throw err;
    }
  }, []);

  // Export/Import
  const exportData = useCallback(async () => {
    return JSON.stringify(data, null, 2);
  }, [data]);

  const importData = useCallback(async (json: string) => {
    try {
      JSON.parse(json);
      console.log('Import not yet implemented with Supabase backend');
      return false;
    } catch (e) {
      console.error('Failed to import data:', e);
      return false;
    }
  }, []);

  // Load activities function
  const loadActivities = useCallback(async () => {
    try {
      const { data: activitiesData, error: activitiesError } = await supabase
        .from('activity_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(500);
      
      if (activitiesError) {
        console.warn('Activity log table may not exist yet:', activitiesError);
        return;
      }
      
      setActivities(activitiesData?.map((a: any) => ({
        id: a.id,
        businessId: a.business_id,
        action: a.action,
        entityType: a.entity_type,
        entityName: a.entity_name,
        details: a.details || '',
        status: a.status,
        createdAt: a.created_at
      })) || []);
    } catch (err) {
      console.error('Failed to load activities:', err);
    }
  }, []);

  // Log activity function
  const logActivity = useCallback(async (
    businessId: string,
    action: 'sync' | 'add' | 'update' | 'delete',
    entityType: 'bot' | 'skill' | 'api' | 'business',
    entityName: string,
    details: Record<string, any> = {},
    status: 'success' | 'failed' = 'success'
  ) => {
    try {
      const { error } = await supabase
        .from('activity_log')
        .insert({
          business_id: businessId,
          action,
          entity_type: entityType,
          entity_name: entityName,
          details,
          status
        });
      
      if (error) {
        console.error('Failed to log activity:', error);
        return;
      }
      
      // Refresh activities
      await loadActivities();
    } catch (err) {
      console.error('Failed to log activity:', err);
    }
  }, [loadActivities]);

  // Stats
  const stats = {
    totalBusinesses: data.businesses.length,
    totalBots: data.businesses.reduce((sum, bd) => sum + bd.bots.length, 0),
    totalSubAgents: data.businesses.reduce((sum, bd) => sum + bd.subAgents.length, 0),
    totalSkills: data.businesses.reduce((sum, bd) => sum + bd.skills.length, 0),
    totalApis: data.businesses.reduce((sum, bd) => sum + bd.apis.length, 0),
    activeBots: data.businesses.reduce((sum, bd) => sum + bd.bots.filter(b => b.status === 'active').length, 0),
    activeSubAgents: data.businesses.reduce((sum, bd) => sum + bd.subAgents.filter(s => s.status === 'active').length, 0),
  };

  // Memory Bank operations
  const addMemoryBank = useCallback(async (memoryBank: Omit<MemoryBank, 'id' | 'createdAt'>) => {
    try {
      const { data: newMemoryBank, error } = await supabase
        .from('memory_banks')
        .insert({
          business_id: memoryBank.businessId,
          filename: memoryBank.filename,
          title: memoryBank.title,
          category: memoryBank.category,
          content_preview: memoryBank.contentPreview,
          last_updated: memoryBank.lastUpdated,
          file_path: memoryBank.filePath
        })
        .select()
        .single();

      if (error) throw error;

      const memoryBankData: MemoryBank = {
        id: newMemoryBank.id,
        businessId: newMemoryBank.business_id,
        filename: newMemoryBank.filename,
        title: newMemoryBank.title,
        category: newMemoryBank.category,
        contentPreview: newMemoryBank.content_preview,
        content: newMemoryBank.content,
        lastUpdated: newMemoryBank.last_updated,
        filePath: newMemoryBank.file_path,
        createdAt: newMemoryBank.created_at
      };

      setMemoryBanks(prev => [memoryBankData, ...prev]);
      return newMemoryBank.id;
    } catch (err) {
      console.error('Failed to add memory bank:', err);
      throw err;
    }
  }, []);

  const updateMemoryBank = useCallback(async (memoryBankId: string, updates: Partial<MemoryBank>) => {
    try {
      const updateData: any = {};
      if (updates.title) updateData.title = updates.title;
      if (updates.category) updateData.category = updates.category;
      if (updates.contentPreview) updateData.content_preview = updates.contentPreview;
      if (updates.lastUpdated) updateData.last_updated = updates.lastUpdated;

      const { error } = await supabase
        .from('memory_banks')
        .update(updateData)
        .eq('id', memoryBankId);

      if (error) throw error;

      setMemoryBanks(prev =>
        prev.map(mb =>
          mb.id === memoryBankId
            ? { ...mb, ...updates }
            : mb
        )
      );
    } catch (err) {
      console.error('Failed to update memory bank:', err);
      throw err;
    }
  }, []);

  const deleteMemoryBank = useCallback(async (memoryBankId: string) => {
    try {
      const { error } = await supabase
        .from('memory_banks')
        .delete()
        .eq('id', memoryBankId);

      if (error) throw error;

      setMemoryBanks(prev => prev.filter(mb => mb.id !== memoryBankId));
    } catch (err) {
      console.error('Failed to delete memory bank:', err);
      throw err;
    }
  }, []);

  // Task operations
  const addTask = useCallback(async (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const insertData: any = {
        business_id: task.businessId,
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
      };
      
      if (task.dueDate) insertData.due_date = task.dueDate;
      if (task.completedAt) insertData.completed_at = task.completedAt;
      
      const { data: newTask, error } = await supabase
        .from('tasks')
        .insert(insertData)
        .select()
        .single();
      
      if (error) throw error;
      
      const taskData: Task = {
        id: newTask.id,
        businessId: newTask.business_id,
        title: newTask.title,
        description: newTask.description || '',
        status: newTask.status,
        priority: newTask.priority,
        createdAt: newTask.created_at,
        updatedAt: newTask.updated_at,
        completedAt: newTask.completed_at,
        dueDate: newTask.due_date
      };
      
      setData(prev => ({
        ...prev,
        tasks: [...prev.tasks, taskData]
      }));
      
      return newTask.id;
    } catch (err) {
      console.error('Failed to add task:', err);
      throw err;
    }
  }, []);

  const updateTask = useCallback(async (taskId: string, updates: Partial<Task>) => {
    try {
      const updateData: any = {};
      if (updates.title !== undefined) updateData.title = updates.title;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.status !== undefined) updateData.status = updates.status;
      if (updates.priority !== undefined) updateData.priority = updates.priority;
      if (updates.dueDate !== undefined) updateData.due_date = updates.dueDate;
      if (updates.completedAt !== undefined) updateData.completed_at = updates.completedAt;
      
      const { error } = await supabase
        .from('tasks')
        .update(updateData)
        .eq('id', taskId);
      
      if (error) throw error;
      
      setData(prev => ({
        ...prev,
        tasks: prev.tasks.map(t =>
          t.id === taskId
            ? { ...t, ...updates, updatedAt: new Date().toISOString() }
            : t
        )
      }));
    } catch (err) {
      console.error('Failed to update task:', err);
      throw err;
    }
  }, []);

  const updateTaskStatus = useCallback(async (taskId: string, status: Task['status']) => {
    try {
      const updateData: any = { status };
      if (status === 'completed') {
        updateData.completed_at = new Date().toISOString();
      } else {
        updateData.completed_at = null;
      }
      
      const { error } = await supabase
        .from('tasks')
        .update(updateData)
        .eq('id', taskId);
      
      if (error) throw error;
      
      setData(prev => ({
        ...prev,
        tasks: prev.tasks.map(t =>
          t.id === taskId
            ? { 
                ...t, 
                status, 
                completedAt: status === 'completed' ? new Date().toISOString() : undefined,
                updatedAt: new Date().toISOString() 
              }
            : t
        )
      }));
    } catch (err) {
      console.error('Failed to update task status:', err);
      throw err;
    }
  }, []);

  const deleteTask = useCallback(async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);
      
      if (error) throw error;
      
      setData(prev => ({
        ...prev,
        tasks: prev.tasks.filter(t => t.id !== taskId)
      }));
    } catch (err) {
      console.error('Failed to delete task:', err);
      throw err;
    }
  }, []);

  return {
    data,
    memoryBanks,
    activities,
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
    addApiKey,
    deleteApiKey,
    addMemoryBank,
    updateMemoryBank,
    deleteMemoryBank,
    addTask,
    updateTask,
    updateTaskStatus,
    deleteTask,
    exportData,
    importData,
    logActivity,
    loadActivities,
  };
}
