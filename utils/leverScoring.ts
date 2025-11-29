import { Lever } from '@/data/goals';
import { OnboardingData } from '@/services/storage';

export type CompanySize = 'small' | 'midsize' | 'large';
export type CloseDurationRange = '1-3' | '4-5' | '6-7' | '8-10' | '11-15' | '15+';

export interface LeverWithFitTags extends Lever {
  recommendedCompanySizes?: CompanySize[];
  recommendedCloseDurationRanges?: CloseDurationRange[];
}

export function getCloseDurationRange(days: number): CloseDurationRange {
  if (days <= 3) return '1-3';
  if (days <= 5) return '4-5';
  if (days <= 7) return '6-7';
  if (days <= 10) return '8-10';
  if (days <= 15) return '11-15';
  return '15+';
}

export function getLeverScore(lever: LeverWithFitTags, onboarding: OnboardingData): number {
  const priorityMap: Record<string, number> = { high: 3, medium: 2, low: 1 };
  const impactMap: Record<string, number> = { high: 3, medium: 2, low: 1 };
  const effortBonusMap: Record<string, number> = { low: 2, medium: 1, high: 0 };

  let score = 0;
  
  const priority = lever.priority || 'medium';
  score += priorityMap[priority] || 2;
  score += impactMap[lever.impact] || 2;
  score += effortBonusMap[lever.effort] || 1;

  if (lever.recommendedCompanySizes?.includes(onboarding.companySize as CompanySize)) {
    score += 2;
  }

  const closeDurationRange = getCloseDurationRange(onboarding.closeDuration);
  if (lever.recommendedCloseDurationRanges?.includes(closeDurationRange)) {
    score += 2;
  }

  return score;
}

export function sortLeversByScore(levers: Lever[], onboarding: OnboardingData | null): Lever[] {
  if (!onboarding) return levers;
  
  return [...levers].sort((a, b) => {
    const scoreA = getLeverScore(a as LeverWithFitTags, onboarding);
    const scoreB = getLeverScore(b as LeverWithFitTags, onboarding);
    return scoreB - scoreA;
  });
}

export function isTopRecommendation(lever: Lever, sortedLevers: Lever[], onboarding: OnboardingData | null): boolean {
  if (!onboarding) return false;
  const index = sortedLevers.findIndex(l => l.id === lever.id);
  return index >= 0 && index < 3;
}

export function getRecommendationBadge(lever: Lever, sortedLevers: Lever[], onboarding: OnboardingData | null): string | null {
  if (!onboarding) return null;
  const index = sortedLevers.findIndex(l => l.id === lever.id);
  
  if (index === 0) return 'Top Recommendation';
  if (index === 1) return 'Quick Win';
  if (index === 2) return 'Recommended';
  
  return null;
}
