import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  ONBOARDING_COMPLETED: '@sigmafinance_onboarding_completed',
  ONBOARDING_DATA: '@sigmafinance_onboarding_data',
  MY_PLAN: '@sigmafinance_my_plan',
};

export interface OnboardingData {
  primaryGoal: string;
  companySize: string;
  closeDuration: number;
  completedAt: string;
}

export interface PlanItem {
  goalId: string;
  goalTitle: string;
  leverId: string;
  leverTitle: string;
  impact: 'low' | 'medium' | 'high';
  complexity: 'low' | 'medium' | 'high';
  status: 'Planned' | 'In progress' | 'Done';
  addedAt: string;
}

export const storage = {
  async isOnboardingCompleted(): Promise<boolean> {
    try {
      const value = await AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETED);
      return value === 'true';
    } catch {
      return false;
    }
  },

  async setOnboardingCompleted(completed: boolean): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETED, String(completed));
    } catch (error) {
      console.error('Error saving onboarding status:', error);
    }
  },

  async getOnboardingData(): Promise<OnboardingData | null> {
    try {
      const value = await AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_DATA);
      return value ? JSON.parse(value) : null;
    } catch {
      return null;
    }
  },

  async setOnboardingData(data: OnboardingData): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_DATA, JSON.stringify(data));
      await this.setOnboardingCompleted(true);
    } catch (error) {
      console.error('Error saving onboarding data:', error);
    }
  },

  async getMyPlan(): Promise<PlanItem[]> {
    try {
      const value = await AsyncStorage.getItem(STORAGE_KEYS.MY_PLAN);
      return value ? JSON.parse(value) : [];
    } catch {
      return [];
    }
  },

  async setMyPlan(plan: PlanItem[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.MY_PLAN, JSON.stringify(plan));
    } catch (error) {
      console.error('Error saving plan:', error);
    }
  },

  async clearOnboarding(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.ONBOARDING_COMPLETED,
        STORAGE_KEYS.ONBOARDING_DATA,
      ]);
    } catch (error) {
      console.error('Error clearing onboarding:', error);
    }
  },

  async clearAll(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.ONBOARDING_COMPLETED,
        STORAGE_KEYS.ONBOARDING_DATA,
        STORAGE_KEYS.MY_PLAN,
      ]);
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  },
};

export { STORAGE_KEYS };
