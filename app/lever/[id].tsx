import { ScrollView, StyleSheet, TouchableOpacity, View, Alert, Linking } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { goals, Lever, Goal } from '@/data/goals';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePlan } from '@/context/PlanContext';
import GlobalHeader from '@/components/GlobalHeader';

const defaultRoles = ['CFO', 'Controller', 'Finance Manager', 'Accounting Team'];
const defaultKPIs = ['Process cycle time', 'Error rate reduction', 'Cost savings', 'Compliance score'];
const defaultChallenges = ['Change resistance', 'System integration complexity', 'Training requirements', 'Initial investment'];
const defaultExamples = ['Leading companies have achieved 40-60% improvement in this area', 'Industry benchmarks suggest significant ROI within 6-12 months'];
const defaultTechReqs = ['ERP system integration', 'Cloud infrastructure', 'API connectivity'];
const defaultChangeManagement = ['Stakeholder buy-in from leadership', 'Clear communication plan', 'Training and enablement program', 'Phased rollout approach'];

export default function LeverDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colors = Colors.dark;
  const { addLever, removeLever, isLeverInPlan, updateLeverStatus, plan } = usePlan();

  let lever: Lever | undefined;
  let parentGoal: Goal | undefined;

  for (const goal of goals) {
    const found = goal.levers.find((l) => l.id === id);
    if (found) {
      lever = found;
      parentGoal = goal;
      break;
    }
  }

  if (!lever || !parentGoal) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        <GlobalHeader title="Lever" showBack />
        <ThemedText>Lever not found</ThemedText>
      </SafeAreaView>
    );
  }

  const planItem = plan.find(p => p.leverId === lever!.id);
  const inPlan = !!planItem;

  const getEffortLabel = (effort: string) => {
    const labels: Record<string, string> = { low: 'Low', medium: 'Moderate', high: 'High' };
    return labels[effort] || effort;
  };

  const getImpactLabel = (impact: string) => {
    const labels: Record<string, string> = { low: 'Low', medium: 'Moderate', high: 'High' };
    return labels[impact] || impact;
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

  const getCategoryColor = (category: string) => {
    const categoryColors: Record<string, string> = {
      'Reconciliation': '#3B82F6',
      'Workflow': '#8B5CF6',
      'Integration': '#10B981',
      'ERP': '#F59E0B',
      'CPM': '#EC4899',
      'Close Management': '#6366F1',
      'FP&A': '#14B8A6',
      'BI': '#F97316',
      'Audit': '#EF4444',
      'AI Finance': '#8B5CF6',
      'RPA': '#06B6D4',
      'IDP': '#84CC16',
      'Treasury': '#0EA5E9',
      'AR': '#22C55E',
      'P2P': '#A855F7',
      'Tax': '#EAB308',
      'GRC': '#DC2626',
    };
    return categoryColors[category] || colors.tint;
  };

  const getPriorityColor = (priority?: string) => {
    const priorityColors: Record<string, string> = {
      high: '#EF4444',
      medium: '#F59E0B',
      low: '#10B981',
    };
    return priorityColors[priority || 'medium'] || colors.warning;
  };

  const getPriorityLabel = (priority?: string) => {
    const labels: Record<string, string> = { high: 'High Priority', medium: 'Medium Priority', low: 'Low Priority' };
    return labels[priority || 'medium'] || 'Medium Priority';
  };

  const handleAddToPlan = async () => {
    await addLever({
      goalId: parentGoal!.id,
      goalTitle: parentGoal!.title,
      leverId: lever!.id,
      leverTitle: lever!.title,
      impact: lever!.impact,
      complexity: lever!.effort,
      status: 'Planned',
    });
    Alert.alert('Added to Plan', `"${lever!.title}" has been added to your plan.`);
  };

  const handleRemoveFromPlan = () => {
    Alert.alert(
      'Remove from Plan',
      `Are you sure you want to remove "${lever!.title}" from your plan?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => removeLever(lever!.id) },
      ]
    );
  };

  const handleToolPress = (toolName: string) => {
    router.push(`/tool/${encodeURIComponent(toolName)}`);
  };

  const roles = lever.responsibleRoles || defaultRoles;
  const kpis = lever.keyKPIs || defaultKPIs;
  const challenges = lever.challengesRisks || defaultChallenges;
  const examples = lever.practicalExamples || defaultExamples;
  const techReqs = lever.technologyRequirements || defaultTechReqs;
  const changeManagement = lever.changeManagement || defaultChangeManagement;
  const priority = lever.priority || (lever.impact === 'high' ? 'high' : lever.impact === 'medium' ? 'medium' : 'low');

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <GlobalHeader title={lever.title} showBack />

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={[styles.heroCard, { backgroundColor: parentGoal.color + '15' }]}>
          <View style={styles.badgeRow}>
            <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(priority) }]}>
              <IconSymbol name="exclamationmark.triangle.fill" size={14} color="#fff" />
              <ThemedText style={styles.priorityBadgeText}>{getPriorityLabel(priority)}</ThemedText>
            </View>
            <View style={[styles.goalBadge, { backgroundColor: parentGoal.color }]}>
              <IconSymbol name={parentGoal.icon as any} size={14} color="#fff" />
              <ThemedText style={styles.goalBadgeText}>{parentGoal.title}</ThemedText>
            </View>
          </View>

          <View style={[styles.effortBenefitBadge, { backgroundColor: colors.card }]}>
            <ThemedText style={[styles.effortBenefitText, { color: colors.textSecondary }]}>
              {getEffortLabel(lever.effort)} effort, {getImpactLabel(lever.impact)} benefit
            </ThemedText>
          </View>

          <ThemedText style={[styles.leverTitle, { color: colors.text }]}>{lever.title}</ThemedText>
          <ThemedText style={[styles.leverDescription, { color: colors.textSecondary }]}>
            {lever.shortDescription}
          </ThemedText>

          <View style={styles.metaRow}>
            <View style={[styles.metaCard, { backgroundColor: colors.card }]}>
              <ThemedText style={[styles.metaLabel, { color: colors.textSecondary }]}>Effort</ThemedText>
              <ThemedText style={[styles.metaValue, { color: getEffortColor(lever.effort) }]}>
                {getEffortLabel(lever.effort)}
              </ThemedText>
            </View>
            <View style={[styles.metaCard, { backgroundColor: colors.card }]}>
              <ThemedText style={[styles.metaLabel, { color: colors.textSecondary }]}>Impact</ThemedText>
              <ThemedText style={[styles.metaValue, { color: getImpactColor(lever.impact) }]}>
                {getImpactLabel(lever.impact)}
              </ThemedText>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.planButton,
            { 
              backgroundColor: inPlan ? colors.card : parentGoal.color,
              borderColor: inPlan ? colors.success : parentGoal.color,
            }
          ]}
          onPress={inPlan ? handleRemoveFromPlan : handleAddToPlan}
          activeOpacity={0.8}
        >
          <IconSymbol
            name={inPlan ? 'checkmark.circle.fill' : 'checklist'}
            size={22}
            color={inPlan ? colors.success : '#fff'}
          />
          <ThemedText style={[styles.planButtonText, { color: inPlan ? colors.success : '#fff' }]}>
            {inPlan ? `In Plan (${planItem?.status})` : 'Add to My Plan'}
          </ThemedText>
        </TouchableOpacity>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <IconSymbol name="person.2.fill" size={22} color={colors.tint} />
            <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>Responsible Roles</ThemedText>
          </View>
          <View style={styles.chipContainer}>
            {roles.map((role, index) => (
              <View key={index} style={[styles.chip, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <ThemedText style={[styles.chipText, { color: colors.text }]}>{role}</ThemedText>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <IconSymbol name="chart.line.uptrend.xyaxis" size={22} color={colors.tint} />
            <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>Key KPIs</ThemedText>
          </View>
          {kpis.map((kpi, index) => (
            <View key={index} style={[styles.listItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={[styles.listDot, { backgroundColor: colors.tint }]} />
              <ThemedText style={[styles.listText, { color: colors.text }]}>{kpi}</ThemedText>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <IconSymbol name="exclamationmark.triangle.fill" size={22} color={colors.warning} />
            <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>Challenges & Risks</ThemedText>
          </View>
          {challenges.map((challenge, index) => (
            <View key={index} style={[styles.listItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={[styles.listDot, { backgroundColor: colors.warning }]} />
              <ThemedText style={[styles.listText, { color: colors.text }]}>{challenge}</ThemedText>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <IconSymbol name="lightbulb.fill" size={22} color={'#F59E0B'} />
            <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>Practical Examples</ThemedText>
          </View>
          {examples.map((example, index) => (
            <View key={index} style={[styles.exampleCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <ThemedText style={[styles.exampleText, { color: colors.text }]}>{example}</ThemedText>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <IconSymbol name="wrench.fill" size={22} color={'#8B5CF6'} />
            <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>Technology Requirements</ThemedText>
          </View>
          {techReqs.map((req, index) => (
            <View key={index} style={[styles.listItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={[styles.listDot, { backgroundColor: '#8B5CF6' }]} />
              <ThemedText style={[styles.listText, { color: colors.text }]}>{req}</ThemedText>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <IconSymbol name="arrow.triangle.2.circlepath" size={22} color={'#06B6D4'} />
            <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>Change Management</ThemedText>
          </View>
          {changeManagement.map((item, index) => (
            <View key={index} style={[styles.listItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={[styles.listDot, { backgroundColor: '#06B6D4' }]} />
              <ThemedText style={[styles.listText, { color: colors.text }]}>{item}</ThemedText>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <IconSymbol name="list.number" size={22} color={parentGoal.color} />
            <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>Implementation Steps</ThemedText>
          </View>
          {lever.implementationGuide.map((step, index) => (
            <View key={index} style={[styles.stepItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={[styles.stepNumber, { backgroundColor: parentGoal.color }]}>
                <ThemedText style={styles.stepNumberText}>{index + 1}</ThemedText>
              </View>
              <ThemedText style={[styles.stepText, { color: colors.text }]}>{step}</ThemedText>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <IconSymbol name="checkmark.circle.fill" size={22} color={colors.success} />
            <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>Benefits</ThemedText>
          </View>
          {lever.benefits.map((benefit, index) => (
            <View key={index} style={[styles.listItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={[styles.listDot, { backgroundColor: colors.success }]} />
              <ThemedText style={[styles.listText, { color: colors.text }]}>{benefit}</ThemedText>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <IconSymbol name="cpu" size={22} color={colors.tint} />
            <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>Recommended AI Tools</ThemedText>
          </View>
          <View style={styles.toolChipsContainer}>
            {lever.aiTools.map((tool, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.toolChip, { backgroundColor: getCategoryColor(tool.category) + '20', borderColor: getCategoryColor(tool.category) + '40' }]}
                onPress={() => handleToolPress(tool.name)}
                activeOpacity={0.7}
              >
                <ThemedText style={[styles.toolChipName, { color: getCategoryColor(tool.category) }]}>
                  {tool.name}
                </ThemedText>
                <IconSymbol name="chevron.right" size={14} color={getCategoryColor(tool.category)} />
              </TouchableOpacity>
            ))}
          </View>

          {lever.aiTools.map((tool, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.toolCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => handleToolPress(tool.name)}
              activeOpacity={0.7}
            >
              <View style={styles.toolHeader}>
                <View style={[styles.toolIcon, { backgroundColor: getCategoryColor(tool.category) + '20' }]}>
                  <IconSymbol name="cpu" size={24} color={getCategoryColor(tool.category)} />
                </View>
                <View style={styles.toolInfo}>
                  <ThemedText style={[styles.toolName, { color: colors.text }]}>{tool.name}</ThemedText>
                  <ThemedText style={[styles.toolDescription, { color: colors.textSecondary }]}>
                    {tool.description}
                  </ThemedText>
                </View>
                <IconSymbol name="chevron.right" size={20} color={colors.textSecondary} />
              </View>
              <View style={[styles.toolCategory, { backgroundColor: getCategoryColor(tool.category) + '15' }]}>
                <ThemedText style={[styles.toolCategoryText, { color: getCategoryColor(tool.category) }]}>
                  {tool.category}
                </ThemedText>
              </View>
            </TouchableOpacity>
          ))}
        </View>

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
    padding: 20,
    borderRadius: 20,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    gap: 6,
  },
  priorityBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  goalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    gap: 6,
  },
  goalBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  effortBenefitBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    marginBottom: 16,
  },
  effortBenefitText: {
    fontSize: 13,
    fontWeight: '500',
  },
  leverTitle: {
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 28,
  },
  leverDescription: {
    fontSize: 15,
    marginTop: 8,
    lineHeight: 22,
  },
  metaRow: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 12,
  },
  metaCard: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  metaLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  metaValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  planButton: {
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
  planButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
  section: {
    marginTop: 28,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
    gap: 12,
  },
  listDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  listText: {
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
  exampleCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
  },
  exampleText: {
    fontSize: 14,
    lineHeight: 22,
    fontStyle: 'italic',
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
    gap: 12,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  stepText: {
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
  toolChipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  toolChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    gap: 6,
  },
  toolChipName: {
    fontSize: 14,
    fontWeight: '600',
  },
  toolCard: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 12,
  },
  toolHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toolIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toolInfo: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  toolName: {
    fontSize: 16,
    fontWeight: '600',
  },
  toolDescription: {
    fontSize: 13,
    marginTop: 4,
  },
  toolCategory: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
    marginTop: 12,
  },
  toolCategoryText: {
    fontSize: 12,
    fontWeight: '600',
  },
  bottomPadding: {
    height: 40,
  },
});
