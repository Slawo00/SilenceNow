import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View, Text, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { goals, Lever } from '@/data/goals';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePlan } from '@/context/PlanContext';
import { useOnboarding } from '@/context/OnboardingContext';
import GlobalHeader from '@/components/GlobalHeader';

const statusColors: Record<string, string> = {
  'Planned': '#6366F1',
  'In progress': '#F59E0B',
  'Done': '#10B981',
};

const statusOptions: Array<'Planned' | 'In progress' | 'Done'> = ['Planned', 'In progress', 'Done'];

const priorityColors: Record<string, string> = {
  high: '#EF4444',
  medium: '#F59E0B',
  low: '#10B981',
};

export default function PlanScreen() {
  const router = useRouter();
  const colors = Colors.dark;
  const { plan, updateLeverStatus, removeLever, isLoading } = usePlan();
  const { onboardingData } = useOnboarding();

  const getLeverDetails = (leverId: string): Lever | undefined => {
    for (const goal of goals) {
      const lever = goal.levers.find(l => l.id === leverId);
      if (lever) return lever;
    }
    return undefined;
  };

  const groupedPlan = goals
    .map(goal => ({
      goal,
      levers: plan.filter(p => p.goalId === goal.id),
    }))
    .filter(group => group.levers.length > 0);

  const totalLevers = plan.length;
  const completedLevers = plan.filter(p => p.status === 'Done').length;
  const inProgressLevers = plan.filter(p => p.status === 'In progress').length;

  const handleStatusChange = (leverId: string, currentStatus: string) => {
    const currentIndex = statusOptions.indexOf(currentStatus as any);
    const nextStatus = statusOptions[(currentIndex + 1) % statusOptions.length];
    updateLeverStatus(leverId, nextStatus);
  };

  const handleRemove = (leverId: string, leverTitle: string) => {
    Alert.alert(
      'Remove from Plan',
      `Are you sure you want to remove "${leverTitle}" from your plan?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => removeLever(leverId) },
      ]
    );
  };

  const recommendedGoal = onboardingData?.primaryGoal
    ? goals.find(g => g.id === onboardingData.primaryGoal)
    : null;

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        <GlobalHeader showLogo />
        <View style={styles.loadingContainer}>
          <ThemedText style={{ color: colors.textSecondary }}>Loading...</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <GlobalHeader showLogo />
      
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <ThemedText style={[styles.pageTitle, { color: colors.text }]}>My Plan</ThemedText>
          <ThemedText style={[styles.pageSubtitle, { color: colors.textSecondary }]}>
            Track your finance transformation journey
          </ThemedText>
        </View>

        {recommendedGoal && (
          <View style={[styles.recommendedBanner, { backgroundColor: recommendedGoal.color + '15', borderColor: recommendedGoal.color + '30' }]}>
            <View style={[styles.recommendedIcon, { backgroundColor: recommendedGoal.color + '30' }]}>
              <IconSymbol name={recommendedGoal.icon as any} size={20} color={recommendedGoal.color} />
            </View>
            <View style={styles.recommendedContent}>
              <Text style={[styles.recommendedLabel, { color: colors.textSecondary }]}>Recommended starting goal</Text>
              <Text style={[styles.recommendedTitle, { color: recommendedGoal.color }]}>{recommendedGoal.title}</Text>
            </View>
            <TouchableOpacity
              style={[styles.viewGoalBtn, { backgroundColor: recommendedGoal.color }]}
              onPress={() => router.push(`/goal/${recommendedGoal.id}`)}
            >
              <Text style={styles.viewGoalBtnText}>View</Text>
            </TouchableOpacity>
          </View>
        )}

        {totalLevers > 0 ? (
          <>
            <View style={styles.statsRow}>
              <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.statValue, { color: colors.tint }]}>{totalLevers}</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.statValue, { color: statusColors['In progress'] }]}>{inProgressLevers}</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>In Progress</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.statValue, { color: statusColors['Done'] }]}>{completedLevers}</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Done</Text>
              </View>
            </View>

            {groupedPlan.map(({ goal, levers }) => (
              <View key={goal.id} style={styles.goalSection}>
                <View style={styles.goalHeader}>
                  <View style={[styles.goalIconSmall, { backgroundColor: goal.color + '20' }]}>
                    <IconSymbol name={goal.icon as any} size={18} color={goal.color} />
                  </View>
                  <Text style={[styles.goalSectionTitle, { color: colors.text }]}>{goal.title}</Text>
                  <View style={[styles.leverCountBadge, { backgroundColor: goal.color + '20' }]}>
                    <Text style={[styles.leverCountText, { color: goal.color }]}>{levers.length}</Text>
                  </View>
                </View>

                {levers.map((lever) => {
                  const leverDetails = getLeverDetails(lever.leverId);
                  const priority = leverDetails?.priority || (lever.impact === 'high' ? 'high' : lever.impact === 'medium' ? 'medium' : 'low');
                  const toolCount = leverDetails?.aiTools?.length || 0;
                  
                  return (
                    <View
                      key={lever.leverId}
                      style={[styles.leverCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                    >
                      <TouchableOpacity
                        style={styles.leverContent}
                        onPress={() => router.push(`/lever/${lever.leverId}`)}
                        activeOpacity={0.7}
                      >
                        <View style={styles.leverTitleRow}>
                          <Text style={[styles.leverTitle, { color: colors.text }]}>{lever.leverTitle}</Text>
                          <View style={[styles.priorityBadge, { backgroundColor: priorityColors[priority] + '20' }]}>
                            <Text style={[styles.priorityText, { color: priorityColors[priority] }]}>
                              {priority.charAt(0).toUpperCase() + priority.slice(1)}
                            </Text>
                          </View>
                        </View>
                        <View style={styles.leverMeta}>
                          <View style={[styles.metaBadge, { backgroundColor: colors.tint + '15' }]}>
                            <Text style={[styles.metaText, { color: colors.tint }]}>Impact: {lever.impact}</Text>
                          </View>
                          <View style={[styles.metaBadge, { backgroundColor: colors.warning + '15' }]}>
                            <Text style={[styles.metaText, { color: colors.warning }]}>Effort: {lever.complexity}</Text>
                          </View>
                          {toolCount > 0 && (
                            <View style={[styles.metaBadge, { backgroundColor: '#8B5CF6' + '15' }]}>
                              <IconSymbol name="cpu" size={12} color="#8B5CF6" />
                              <Text style={[styles.metaText, { color: '#8B5CF6' }]}>{toolCount}</Text>
                            </View>
                          )}
                        </View>
                      </TouchableOpacity>

                      <View style={styles.leverActions}>
                        <TouchableOpacity
                          style={[styles.statusBtn, { backgroundColor: statusColors[lever.status] }]}
                          onPress={() => handleStatusChange(lever.leverId, lever.status)}
                        >
                          <Text style={styles.statusBtnText}>{lever.status}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.removeBtn, { backgroundColor: colors.error + '15' }]}
                          onPress={() => handleRemove(lever.leverId, lever.leverTitle)}
                        >
                          <IconSymbol name="xmark.circle.fill" size={18} color={colors.error} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                })}
              </View>
            ))}
          </>
        ) : (
          <View style={[styles.emptyState, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.emptyIcon, { backgroundColor: colors.tint + '15' }]}>
              <IconSymbol name="doc.text.fill" size={32} color={colors.tint} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No levers in your plan yet</Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              Browse goals and add strategic levers to build your optimization roadmap
            </Text>
            <TouchableOpacity
              style={[styles.browseBtn, { backgroundColor: colors.tint }]}
              onPress={() => router.push('/(tabs)/goals')}
            >
              <Text style={styles.browseBtnText}>Browse Goals</Text>
              <IconSymbol name="chevron.right" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 8,
  },
  pageSubtitle: {
    fontSize: 15,
    lineHeight: 22,
  },
  recommendedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  recommendedIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recommendedContent: {
    flex: 1,
    marginLeft: 12,
  },
  recommendedLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  recommendedTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  viewGoalBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  viewGoalBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  goalSection: {
    marginBottom: 24,
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
    gap: 10,
  },
  goalIconSmall: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalSectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
  },
  leverCountBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  leverCountText: {
    fontSize: 13,
    fontWeight: '600',
  },
  leverCard: {
    marginHorizontal: 20,
    marginBottom: 10,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
  },
  leverContent: {
    marginBottom: 12,
  },
  leverTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    gap: 10,
  },
  leverTitle: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
  priorityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  priorityText: {
    fontSize: 11,
    fontWeight: '600',
  },
  leverMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  metaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    fontWeight: '500',
  },
  leverActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  statusBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  statusBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  removeBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    marginHorizontal: 20,
    padding: 32,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 24,
  },
  browseBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 6,
  },
  browseBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomPadding: {
    height: 100,
  },
});
