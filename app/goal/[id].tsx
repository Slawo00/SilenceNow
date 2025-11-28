import { ScrollView, StyleSheet, TouchableOpacity, View, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { goals } from '@/data/goals';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePlan } from '@/context/PlanContext';
import GlobalHeader from '@/components/GlobalHeader';

const priorityColors: Record<string, string> = {
  high: '#EF4444',
  medium: '#F59E0B',
  low: '#10B981',
};

export default function GoalDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colors = Colors.dark;
  const { addMultipleLevers, isLeverInPlan, plan } = usePlan();

  const goal = goals.find((g) => g.id === id);

  if (!goal) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        <GlobalHeader title="Goal" showBack />
        <ThemedText>Goal not found</ThemedText>
      </SafeAreaView>
    );
  }

  const leversInPlan = goal.levers.filter(l => isLeverInPlan(l.id)).length;
  const allInPlan = leversInPlan === goal.levers.length;

  const getEffortLabel = (effort: string) => {
    const labels: Record<string, string> = { low: 'Low', medium: 'Moderate', high: 'High' };
    return labels[effort] || effort;
  };

  const getImpactLabel = (impact: string) => {
    const labels: Record<string, string> = { low: 'Low', medium: 'Moderate', high: 'High' };
    return labels[impact] || impact;
  };

  const getPriorityLabel = (priority: string) => {
    const labels: Record<string, string> = { high: 'High', medium: 'Medium', low: 'Low' };
    return labels[priority] || priority;
  };

  const getEffortColor = (effort: string) => {
    const effortColors: Record<string, string> = {
      low: colors.success,
      medium: colors.warning,
      high: colors.error,
    };
    return effortColors[effort] || colors.textSecondary;
  };

  const getImpactColor = (impact: string) => {
    const impactColors: Record<string, string> = {
      low: colors.textSecondary,
      medium: colors.warning,
      high: colors.success,
    };
    return impactColors[impact] || colors.textSecondary;
  };

  const getPriority = (lever: typeof goal.levers[0]) => {
    if (lever.priority) return lever.priority;
    if (lever.impact === 'high') return 'high';
    if (lever.impact === 'medium') return 'medium';
    return 'low';
  };

  const handleAddAllToP = async () => {
    const leversToAdd = goal.levers
      .filter(l => !isLeverInPlan(l.id))
      .map(lever => ({
        goalId: goal.id,
        goalTitle: goal.title,
        leverId: lever.id,
        leverTitle: lever.title,
        impact: lever.impact,
        complexity: lever.effort,
        status: 'Planned' as const,
      }));

    if (leversToAdd.length === 0) {
      Alert.alert('Already Added', 'All levers from this goal are already in your plan.');
      return;
    }

    await addMultipleLevers(leversToAdd);
    Alert.alert(
      'Added to Plan',
      `${leversToAdd.length} lever${leversToAdd.length > 1 ? 's' : ''} added to your plan.`,
      [{ text: 'View Plan', onPress: () => router.push('/(tabs)/plan') }, { text: 'OK' }]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <GlobalHeader title={goal.title} showBack />

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={[styles.heroCard, { backgroundColor: goal.color + '15' }]}>
          <View style={[styles.heroIcon, { backgroundColor: goal.color + '30' }]}>
            <IconSymbol name={goal.icon as any} size={48} color={goal.color} />
          </View>
          <ThemedText style={[styles.heroTitle, { color: colors.text }]}>{goal.title}</ThemedText>
          <ThemedText style={[styles.heroDescription, { color: colors.textSecondary }]}>
            {goal.description}
          </ThemedText>
          <View style={[styles.leverCount, { backgroundColor: goal.color }]}>
            <ThemedText style={styles.leverCountText}>
              {goal.levers.length} Strategic Levers
            </ThemedText>
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.addAllButton,
            { 
              backgroundColor: allInPlan ? colors.card : goal.color,
              borderColor: allInPlan ? colors.border : goal.color,
            }
          ]}
          onPress={handleAddAllToP}
          disabled={allInPlan}
          activeOpacity={0.8}
        >
          <IconSymbol
            name={allInPlan ? 'checkmark.circle.fill' : 'checklist'}
            size={22}
            color={allInPlan ? colors.success : '#fff'}
          />
          <ThemedText style={[
            styles.addAllButtonText,
            { color: allInPlan ? colors.success : '#fff' }
          ]}>
            {allInPlan ? 'All Levers in Plan' : 'Add All Levers to My Plan'}
          </ThemedText>
          {leversInPlan > 0 && !allInPlan && (
            <View style={[styles.addedBadge, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
              <ThemedText style={styles.addedBadgeText}>{leversInPlan}/{goal.levers.length}</ThemedText>
            </View>
          )}
        </TouchableOpacity>

        <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>Strategic Levers</ThemedText>

        {goal.levers.map((lever, index) => {
          const inPlan = isLeverInPlan(lever.id);
          const priority = getPriority(lever);
          
          return (
            <TouchableOpacity
              key={lever.id}
              style={[styles.leverCard, { backgroundColor: colors.card, borderColor: inPlan ? goal.color : colors.border }]}
              onPress={() => router.push(`/lever/${lever.id}`)}
              activeOpacity={0.7}
            >
              <View style={styles.leverRow1}>
                <View style={[styles.leverNumber, { backgroundColor: goal.color }]}>
                  <ThemedText style={styles.leverNumberText}>{index + 1}</ThemedText>
                </View>
                <ThemedText style={[styles.leverTitle, { color: colors.text }]} numberOfLines={2}>
                  {lever.title}
                </ThemedText>
                {inPlan ? (
                  <IconSymbol name="checkmark.circle.fill" size={22} color={colors.success} />
                ) : (
                  <IconSymbol name="chevron.right" size={18} color={colors.icon} />
                )}
              </View>

              <View style={styles.leverRow2}>
                <View style={styles.metaItem}>
                  <ThemedText style={[styles.metaLabel, { color: colors.textSecondary }]}>Priority:</ThemedText>
                  <View style={[styles.metaBadge, { backgroundColor: priorityColors[priority] + '20' }]}>
                    <ThemedText style={[styles.metaValue, { color: priorityColors[priority] }]}>
                      {getPriorityLabel(priority)}
                    </ThemedText>
                  </View>
                </View>
                <View style={styles.metaItem}>
                  <ThemedText style={[styles.metaLabel, { color: colors.textSecondary }]}>Effort:</ThemedText>
                  <View style={[styles.metaBadge, { backgroundColor: getEffortColor(lever.effort) + '20' }]}>
                    <ThemedText style={[styles.metaValue, { color: getEffortColor(lever.effort) }]}>
                      {getEffortLabel(lever.effort)}
                    </ThemedText>
                  </View>
                </View>
                <View style={styles.metaItem}>
                  <ThemedText style={[styles.metaLabel, { color: colors.textSecondary }]}>Impact:</ThemedText>
                  <View style={[styles.metaBadge, { backgroundColor: getImpactColor(lever.impact) + '20' }]}>
                    <ThemedText style={[styles.metaValue, { color: getImpactColor(lever.impact) }]}>
                      {getImpactLabel(lever.impact)}
                    </ThemedText>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  heroCard: {
    marginHorizontal: 20,
    padding: 24,
    borderRadius: 24,
    alignItems: 'center',
  },
  heroIcon: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
  },
  heroDescription: {
    fontSize: 15,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 22,
  },
  leverCount: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 16,
  },
  leverCountText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  addAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginTop: 20,
    paddingVertical: 16,
    borderRadius: 14,
    gap: 10,
    borderWidth: 1,
  },
  addAllButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
  addedBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  addedBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    paddingHorizontal: 20,
    marginTop: 32,
    marginBottom: 16,
  },
  leverCard: {
    marginHorizontal: 20,
    marginBottom: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  leverRow1: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  leverNumber: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  leverNumberText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  leverTitle: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
  leverRow2: {
    flexDirection: 'row',
    marginTop: 10,
    marginLeft: 38,
    gap: 12,
    flexWrap: 'wrap',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaLabel: {
    fontSize: 11,
  },
  metaBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  metaValue: {
    fontSize: 11,
    fontWeight: '600',
  },
  bottomPadding: {
    height: 40,
  },
});
