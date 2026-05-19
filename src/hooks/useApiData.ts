import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../services/apiClient';
import type { DashboardData, Business, Machine } from '../types';

export function useApiData() {
  const [data, setData] = useState<DashboardData>(({ businesses: [], apiKeys: [], tasks: [], activities: [], memoryBanks: [] }));
  const [machines, setMachines] = useState<Machine[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load data from API
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load machines with their skills
        const machinesRes = await apiClient.getMachines();
        if (machinesRes.success) {
          setMachines(machinesRes.data || []);
        }

        // Load businesses (traditional data)
        const businessesRes = await apiClient.getBusinesses();
        const apiKeysRes = await apiClient.getApiKeys();
        
        setData(prev => ({
          ...prev,
          businesses: businessesRes.data || [],
          apiKeys: apiKeysRes.data || []
        }));
        
        setIsLoaded(true);
      } catch (err: any) {
        console.error('Failed to load data:', err);
        setError(err.message || 'Failed to load data');
        setIsLoaded(true);
      }
    };

    loadData();
  }, []);

  // Refresh machines (useful after sync)
  const refreshMachines = useCallback(async () => {
    try {
      const res = await apiClient.getMachines();
      if (res.success) {
        setMachines(res.data || []);
      }
      return res;
    } catch (err: any) {
      console.error('Failed to refresh machines:', err);
      throw err;
    }
  }, []);

  // Get skills for a specific machine
  const getMachineSkills = useCallback(async (machineId: string) => {
    try {
      const res = await apiClient.getMachineSkills(machineId);
      return res.data || [];
    } catch (err: any) {
      console.error('Failed to get machine skills:', err);
      return [];
    }
  }, []);

  // Business CRUD operations
  const createBusiness = useCallback(async (business: Partial<Business>) => {
    try {
      const res = await apiClient.createBusiness(business);
      if (res.success) {
        setData(prev => ({
          ...prev,
          businesses: [...prev.businesses, res.data]
        }));
      }
      return res;
    } catch (err: any) {
      console.error('Failed to create business:', err);
      throw err;
    }
  }, []);

  const updateBusiness = useCallback(async (id: string, updates: Partial<Business>) => {
    try {
      const res = await apiClient.updateBusiness(id, updates);
      if (res.success) {
        setData(prev => ({
          ...prev,
          businesses: prev.businesses.map(b => 
            b.business.id === id ? res.data : b
          )
        }));
      }
      return res;
    } catch (err: any) {
      console.error('Failed to update business:', err);
      throw err;
    }
  }, []);

  const deleteBusiness = useCallback(async (id: string) => {
    try {
      const res = await apiClient.deleteBusiness(id);
      if (res.success) {
        setData(prev => ({
          ...prev,
          businesses: prev.businesses.filter(b => b.business.id !== id)
        }));
      }
      return res;
    } catch (err: any) {
      console.error('Failed to delete business:', err);
      throw err;
    }
  }, []);

  return {
    data,
    machines,
    isLoaded,
    error,
    refreshMachines,
    getMachineSkills,
    createBusiness,
    updateBusiness,
    deleteBusiness
  };
}
