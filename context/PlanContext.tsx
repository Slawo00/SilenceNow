import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { storage, PlanItem } from '@/services/storage';

interface PlanContextType {
  plan: PlanItem[];
  isLoading: boolean;
  addLever: (item: Omit<PlanItem, 'addedAt'>) => Promise<void>;
  addMultipleLevers: (items: Omit<PlanItem, 'addedAt'>[]) => Promise<void>;
  removeLever: (leverId: string) => Promise<void>;
  updateLeverStatus: (leverId: string, status: PlanItem['status']) => Promise<void>;
  isLeverInPlan: (leverId: string) => boolean;
  getLeversByGoal: (goalId: string) => PlanItem[];
  clearPlan: () => Promise<void>;
}

const PlanContext = createContext<PlanContextType | undefined>(undefined);

export function PlanProvider({ children }: { children: ReactNode }) {
  const [plan, setPlan] = useState<PlanItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPlan();
  }, []);

  const loadPlan = async () => {
    try {
      const savedPlan = await storage.getMyPlan();
      setPlan(savedPlan);
    } catch (error) {
      console.error('Error loading plan:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const savePlan = async (newPlan: PlanItem[]) => {
    await storage.setMyPlan(newPlan);
    setPlan(newPlan);
  };

  const addLever = async (item: Omit<PlanItem, 'addedAt'>) => {
    if (plan.some(p => p.leverId === item.leverId)) {
      return;
    }
    const newItem: PlanItem = {
      ...item,
      addedAt: new Date().toISOString(),
    };
    const newPlan = [...plan, newItem];
    await savePlan(newPlan);
  };

  const addMultipleLevers = async (items: Omit<PlanItem, 'addedAt'>[]) => {
    const existingIds = new Set(plan.map(p => p.leverId));
    const newItems = items
      .filter(item => !existingIds.has(item.leverId))
      .map(item => ({
        ...item,
        addedAt: new Date().toISOString(),
      }));
    
    if (newItems.length > 0) {
      const newPlan = [...plan, ...newItems];
      await savePlan(newPlan);
    }
  };

  const removeLever = async (leverId: string) => {
    const newPlan = plan.filter(p => p.leverId !== leverId);
    await savePlan(newPlan);
  };

  const updateLeverStatus = async (leverId: string, status: PlanItem['status']) => {
    const newPlan = plan.map(p =>
      p.leverId === leverId ? { ...p, status } : p
    );
    await savePlan(newPlan);
  };

  const isLeverInPlan = useCallback((leverId: string) => {
    return plan.some(p => p.leverId === leverId);
  }, [plan]);

  const getLeversByGoal = useCallback((goalId: string) => {
    return plan.filter(p => p.goalId === goalId);
  }, [plan]);

  const clearPlan = async () => {
    await savePlan([]);
  };

  return (
    <PlanContext.Provider
      value={{
        plan,
        isLoading,
        addLever,
        addMultipleLevers,
        removeLever,
        updateLeverStatus,
        isLeverInPlan,
        getLeversByGoal,
        clearPlan,
      }}
    >
      {children}
    </PlanContext.Provider>
  );
}

export function usePlan() {
  const context = useContext(PlanContext);
  if (context === undefined) {
    throw new Error('usePlan must be used within a PlanProvider');
  }
  return context;
}
