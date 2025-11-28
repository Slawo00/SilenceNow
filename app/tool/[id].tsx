import { ScrollView, StyleSheet, TouchableOpacity, View, Linking, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { getToolById, getToolByName, AIToolExtended } from '@/data/aiTools';
import { goals } from '@/data/goals';
import { SafeAreaView } from 'react-native-safe-area-context';
import GlobalHeader from '@/components/GlobalHeader';

const goalInfo: Record<string, { name: string; color: string; icon: string }> = {
  speed: { name: 'Speed (Fast Close)', color: '#00D4AA', icon: 'bolt.fill' },
  quality: { name: 'Quality & Accuracy', color: '#10B981', icon: 'checkmark.circle.fill' },
  automation: { name: 'Automation', color: '#F59E0B', icon: 'gearshape.fill' },
  compliance: { name: 'Compliance & Governance', color: '#6366F1', icon: 'shield.fill' },
};

export default function ToolDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colors = Colors.dark;

  const toolId = decodeURIComponent(id || '');
  let tool: AIToolExtended | undefined = getToolById(toolId);
  
  if (!tool) {
    tool = getToolByName(toolId);
  }

  const relatedLevers = goals.flatMap(goal =>
    goal.levers
      .filter(lever => lever.aiTools.some(t => 
        t.name.toLowerCase() === tool?.name.toLowerCase()
      ))
      .map(lever => ({ lever, goal }))
  );

  if (!tool) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        <GlobalHeader title="Tool" showBack />
        <View style={styles.errorContainer}>
          <ThemedText style={[styles.errorText, { color: colors.text }]}>Tool not found</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  const getCategoryColor = (category: string) => {
    const categoryColors: Record<string, string> = {
      'Reconciliation': '#3B82F6',
      'Workflow': '#8B5CF6',
      'Integration': '#10B981',
      'ERP': '#F59E0B',
      'CPM': '#EC4899',
      'Close Management': '#6366F1',
      'FP&A': '#14B8A6',
      'FP&A & Modeling': '#14B8A6',
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
      'AP Automation': '#A855F7',
      'Analytics': '#3B82F6',
      'AI Reporting': '#EC4899',
      'AI/ML': '#7C3AED',
      'Compliance': '#6366F1',
      'Data Management': '#059669',
      'Data Provider': '#64748B',
      'Expense Management': '#F59E0B',
      'IC Management': '#10B981',
      'NLG': '#EC4899',
      'Process Intelligence': '#8B5CF6',
      'Reporting': '#F59E0B',
      'Risk': '#EF4444',
      'Security': '#EF4444',
      'Accounting Automation': '#00D4AA',
    };
    return categoryColors[category] || colors.tint;
  };

  const handleOpenWebsite = () => {
    if (tool?.url) {
      Linking.openURL(tool.url).catch(() => {
        Alert.alert('Error', 'Unable to open website');
      });
    } else {
      Alert.alert('No Website', 'Website URL not available for this tool');
    }
  };

  const categoryColor = getCategoryColor(tool.category);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <GlobalHeader title={tool.name} showBack />

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={[styles.heroCard, { backgroundColor: categoryColor + '15' }]}>
          <View style={[styles.toolLogoContainer, { backgroundColor: categoryColor + '25' }]}>
            <IconSymbol name="cpu" size={48} color={categoryColor} />
          </View>

          <ThemedText style={[styles.toolName, { color: colors.text }]}>{tool.name}</ThemedText>
          <ThemedText style={[styles.toolDescription, { color: colors.textSecondary }]}>
            {tool.description}
          </ThemedText>

          <View style={[styles.categoryBadge, { backgroundColor: categoryColor }]}>
            <ThemedText style={styles.categoryBadgeText}>{tool.category}</ThemedText>
          </View>
        </View>

        {tool.url && (
          <TouchableOpacity
            style={[styles.websiteButton, { backgroundColor: categoryColor }]}
            onPress={handleOpenWebsite}
            activeOpacity={0.8}
          >
            <IconSymbol name="arrow.up.right" size={20} color="#fff" />
            <ThemedText style={styles.websiteButtonText}>Open Website</ThemedText>
          </TouchableOpacity>
        )}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <IconSymbol name="star.fill" size={22} color={'#F59E0B'} />
            <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>
              Key Features
            </ThemedText>
          </View>
          <View style={[styles.featuresCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {tool.keyFeatures.map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <View style={[styles.featureDot, { backgroundColor: categoryColor }]} />
                <ThemedText style={[styles.featureText, { color: colors.text }]}>
                  {feature}
                </ThemedText>
              </View>
            ))}
          </View>
        </View>

        {tool.recommendedGoals.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <IconSymbol name="target" size={22} color={colors.tint} />
              <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>
                Recommended For
              </ThemedText>
            </View>
            <View style={styles.goalChipsContainer}>
              {tool.recommendedGoals.map(goalId => {
                const goal = goalInfo[goalId];
                if (!goal) return null;
                return (
                  <TouchableOpacity
                    key={goalId}
                    style={[styles.goalChip, { backgroundColor: goal.color + '20', borderColor: goal.color + '40' }]}
                    onPress={() => router.push(`/goal/${goalId}`)}
                    activeOpacity={0.7}
                  >
                    <IconSymbol name={goal.icon as any} size={18} color={goal.color} />
                    <ThemedText style={[styles.goalChipText, { color: goal.color }]}>{goal.name}</ThemedText>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {relatedLevers.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <IconSymbol name="slider.horizontal.3" size={22} color={colors.tint} />
              <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>
                Related Strategic Levers ({relatedLevers.length})
              </ThemedText>
            </View>
            {relatedLevers.slice(0, 5).map(({ lever, goal }) => (
              <TouchableOpacity
                key={lever.id}
                style={[styles.leverCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => router.push(`/lever/${lever.id}`)}
                activeOpacity={0.7}
              >
                <View style={styles.leverHeader}>
                  <View style={[styles.leverGoalBadge, { backgroundColor: goal.color }]}>
                    <IconSymbol name={goal.icon as any} size={14} color="#fff" />
                  </View>
                  <View style={styles.leverInfo}>
                    <ThemedText style={[styles.leverTitle, { color: colors.text }]} numberOfLines={1}>
                      {lever.title}
                    </ThemedText>
                    <ThemedText style={[styles.leverGoalName, { color: goal.color }]}>{goal.title}</ThemedText>
                  </View>
                  <IconSymbol name="chevron.right" size={18} color={colors.textSecondary} />
                </View>
              </TouchableOpacity>
            ))}
            {relatedLevers.length > 5 && (
              <ThemedText style={[styles.moreLeversText, { color: colors.textSecondary }]}>
                +{relatedLevers.length - 5} more levers use this tool
              </ThemedText>
            )}
          </View>
        )}

        <View style={styles.section}>
          <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.infoRow}>
              <ThemedText style={[styles.infoLabel, { color: colors.textSecondary }]}>Category</ThemedText>
              <View style={[styles.infoBadge, { backgroundColor: categoryColor + '20' }]}>
                <ThemedText style={[styles.infoBadgeText, { color: categoryColor }]}>{tool.category}</ThemedText>
              </View>
            </View>
            <View style={styles.infoRow}>
              <ThemedText style={[styles.infoLabel, { color: colors.textSecondary }]}>Website</ThemedText>
              <ThemedText style={[styles.infoValue, { color: colors.tint }]} numberOfLines={1}>
                {tool.url ? new URL(tool.url).hostname : 'Not available'}
              </ThemedText>
            </View>
          </View>
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
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 16,
  },
  heroCard: {
    marginHorizontal: 20,
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
  },
  toolLogoContainer: {
    width: 88,
    height: 88,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  toolName: {
    fontSize: 26,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
  },
  toolDescription: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 16,
  },
  categoryBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  categoryBadgeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  websiteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginTop: 20,
    paddingVertical: 16,
    borderRadius: 14,
    gap: 8,
  },
  websiteButtonText: {
    color: '#fff',
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
  goalChipsContainer: {
    gap: 10,
  },
  goalChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 12,
  },
  goalChipText: {
    fontSize: 15,
    fontWeight: '600',
  },
  leverCard: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 10,
  },
  leverHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  leverGoalBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  leverInfo: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  leverTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  leverGoalName: {
    fontSize: 12,
    marginTop: 2,
  },
  moreLeversText: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 4,
    fontStyle: 'italic',
  },
  featuresCard: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
  },
  featureDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  featureText: {
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
  infoCard: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 14,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  infoBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  infoBadgeText: {
    fontSize: 13,
    fontWeight: '600',
  },
  bottomPadding: {
    height: 40,
  },
});
