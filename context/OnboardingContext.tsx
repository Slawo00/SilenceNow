import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { storage, OnboardingData } from '@/services/storage';

interface OnboardingContextType {
  isLoading: boolean;
  isOnboardingCompleted: boolean;
  onboardingData: OnboardingData | null;
  completeOnboarding: (data: OnboardingData) => Promise<void>;
  resetOnboarding: () => Promise<void>;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isOnboardingCompleted, setIsOnboardingCompleted] = useState(false);
  const [onboardingData, setOnboardingData] = useState<OnboardingData | null>(null);

  useEffect(() => {
    loadOnboardingState();
  }, []);

  const loadOnboardingState = async () => {
    try {
      const completed = await storage.isOnboardingCompleted();
      const data = await storage.getOnboardingData();
      setIsOnboardingCompleted(completed);
      setOnboardingData(data);
    } catch (error) {
      console.error('Error loading onboarding state:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const completeOnboarding = async (data: OnboardingData) => {
    await storage.setOnboardingData(data);
    setOnboardingData(data);
    setIsOnboardingCompleted(true);
  };

  const resetOnboarding = async () => {
    await storage.clearOnboarding();
    setIsOnboardingCompleted(false);
    setOnboardingData(null);
  };

  return (
    <OnboardingContext.Provider
      value={{
        isLoading,
        isOnboardingCompleted,
        onboardingData,
        completeOnboarding,
        resetOnboarding,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
}
