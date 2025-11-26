import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { goals, Lever, Goal } from '@/data/goals';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LeverDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme() ?? 'light';
  const router = useRouter();
  const colors = Colors[colorScheme];

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
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <ThemedText>Hebel nicht gefunden</ThemedText>
      </SafeAreaView>
    );
  }

  const getEffortLabel = (effort: string) => {
    const labels: Record<string, string> = { low: 'Niedrig', medium: 'Mittel', high: 'Hoch' };
    return labels[effort] || effort;
  };

  const getImpactLabel = (impact: string) => {
    const labels: Record<string, string> = { low: 'Niedrig', medium: 'Mittel', high: 'Hoch' };
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

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <IconSymbol name="chevron.left" size={24} color={colors.tint} />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle} numberOfLines={1}>
          {lever.title}
        </ThemedText>
        <View style={styles.backButton} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={[styles.heroCard, { backgroundColor: parentGoal.color + '15' }]}>
          <View style={[styles.goalBadge, { backgroundColor: parentGoal.color }]}>
            <IconSymbol name={parentGoal.icon as any} size={16} color="#fff" />
            <ThemedText style={styles.goalBadgeText}>{parentGoal.title}</ThemedText>
          </View>
          <ThemedText style={styles.leverTitle}>{lever.title}</ThemedText>
          <ThemedText style={[styles.leverDescription, { color: colors.textSecondary }]}>
            {lever.shortDescription}
          </ThemedText>

          <View style={styles.metaRow}>
            <View style={[styles.metaCard, { backgroundColor: colors.card }]}>
              <ThemedText style={[styles.metaLabel, { color: colors.textSecondary }]}>Aufwand</ThemedText>
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

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <IconSymbol name="checkmark.circle.fill" size={24} color={colors.success} />
            <ThemedText style={styles.sectionTitle}>Vorteile</ThemedText>
          </View>
          {lever.benefits.map((benefit, index) => (
            <View key={index} style={[styles.benefitItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={[styles.benefitDot, { backgroundColor: colors.success }]} />
              <ThemedText style={styles.benefitText}>{benefit}</ThemedText>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <IconSymbol name="list.number" size={24} color={parentGoal.color} />
            <ThemedText style={styles.sectionTitle}>Implementierungsschritte</ThemedText>
          </View>
          {lever.implementationGuide.map((step, index) => (
            <View key={index} style={[styles.stepItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={[styles.stepNumber, { backgroundColor: parentGoal.color }]}>
                <ThemedText style={styles.stepNumberText}>{index + 1}</ThemedText>
              </View>
              <ThemedText style={styles.stepText}>{step}</ThemedText>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <IconSymbol name="cpu" size={24} color={colors.tint} />
            <ThemedText style={styles.sectionTitle}>Empfohlene KI-Tools</ThemedText>
          </View>
          {lever.aiTools.map((tool, index) => (
            <View
              key={index}
              style={[styles.toolCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <View style={styles.toolHeader}>
                <View style={[styles.toolIcon, { backgroundColor: getCategoryColor(tool.category) + '20' }]}>
                  <IconSymbol name="cpu" size={24} color={getCategoryColor(tool.category)} />
                </View>
                <View style={styles.toolInfo}>
                  <ThemedText style={styles.toolName}>{tool.name}</ThemedText>
                  <ThemedText style={[styles.toolDescription, { color: colors.textSecondary }]}>
                    {tool.description}
                  </ThemedText>
                </View>
              </View>
              <View style={[styles.toolCategory, { backgroundColor: getCategoryColor(tool.category) + '15' }]}>
                <ThemedText style={[styles.toolCategoryText, { color: getCategoryColor(tool.category) }]}>
                  {tool.category}
                </ThemedText>
              </View>
            </View>
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
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  heroCard: {
    marginHorizontal: 20,
    padding: 24,
    borderRadius: 24,
  },
  goalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
    marginBottom: 16,
  },
  goalBadgeText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  leverTitle: {
    fontSize: 24,
    fontWeight: '800',
    lineHeight: 30,
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
    padding: 16,
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
  section: {
    marginTop: 32,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
    gap: 12,
  },
  benefitDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  benefitText: {
    fontSize: 15,
    flex: 1,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
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
    fontSize: 14,
    fontWeight: '700',
  },
  stepText: {
    fontSize: 15,
    flex: 1,
    lineHeight: 22,
  },
  toolCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
  },
  toolHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toolIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toolInfo: {
    flex: 1,
    marginLeft: 12,
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
    borderRadius: 12,
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
