import { ScrollView, StyleSheet, TouchableOpacity, View, Linking, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { getAllAITools, goals } from '@/data/goals';
import { SafeAreaView } from 'react-native-safe-area-context';
import GlobalHeader from '@/components/GlobalHeader';

const toolUrls: Record<string, string> = {
  'BlackLine': 'https://www.blackline.com',
  'ReconArt': 'https://www.reconart.com',
  'Workiva': 'https://www.workiva.com',
  'FloQast': 'https://www.floqast.com',
  'Fivetran': 'https://www.fivetran.com',
  'Airbyte': 'https://www.airbyte.com',
  'SAP S/4HANA': 'https://www.sap.com/products/erp/s4hana.html',
  'Oracle Financials': 'https://www.oracle.com/erp/financials/',
  'OneStream': 'https://www.onestream.com',
  'Trintech Cadency': 'https://www.trintech.com',
  'Prophix': 'https://www.prophix.com',
  'Vic.ai': 'https://www.vic.ai',
  'AppZen': 'https://www.appzen.com',
  'SAP BPC': 'https://www.sap.com/products/business-planning-consolidation.html',
  'CCH Tagetik': 'https://www.wolterskluwer.com/en/solutions/cch-tagetik',
  'Power BI': 'https://powerbi.microsoft.com',
  'Tableau': 'https://www.tableau.com',
  'Trintech': 'https://www.trintech.com',
  'MindBridge': 'https://www.mindbridge.ai',
  'HighRadius': 'https://www.highradius.com',
  'ServiceNow': 'https://www.servicenow.com',
  'Talend': 'https://www.talend.com',
  'Informatica': 'https://www.informatica.com',
  'SAP GRC': 'https://www.sap.com/products/grc.html',
  'Jedox': 'https://www.jedox.com',
  'Anaplan': 'https://www.anaplan.com',
  'SAP Access Control': 'https://www.sap.com/products/access-control.html',
  'SailPoint': 'https://www.sailpoint.com',
  'Celonis': 'https://www.celonis.com',
  'UiPath Process Mining': 'https://www.uipath.com/product/process-mining',
  'UiPath': 'https://www.uipath.com',
  'Automation Anywhere': 'https://www.automationanywhere.com',
  'ABBYY': 'https://www.abbyy.com',
  'Kofax': 'https://www.kofax.com',
  'HighRadius Collections': 'https://www.highradius.com/collections',
  'Esker': 'https://www.esker.com',
  'SAP Ariba': 'https://www.sap.com/products/ariba-network.html',
  'Coupa': 'https://www.coupa.com',
  'Microsoft Power Automate': 'https://powerautomate.microsoft.com',
  'Nintex': 'https://www.nintex.com',
  'Vertex': 'https://www.vertexinc.com',
  'Avalara': 'https://www.avalara.com',
  'Audit Board': 'https://www.auditboard.com',
  'Kyriba': 'https://www.kyriba.com',
  'TreasuryXpress': 'https://www.treasuryxpress.com',
};

export default function ToolDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colors = Colors.dark;

  const toolName = decodeURIComponent(id || '');
  const allTools = getAllAITools();
  const tool = allTools.find(t => t.name === toolName);

  const toolGoals = goals.filter(goal =>
    goal.levers.some(lever =>
      lever.aiTools.some(t => t.name === toolName)
    )
  );

  const relatedLevers = goals.flatMap(goal =>
    goal.levers
      .filter(lever => lever.aiTools.some(t => t.name === toolName))
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
    };
    return categoryColors[category] || colors.tint;
  };

  const handleOpenWebsite = () => {
    const url = tool.url || toolUrls[tool.name];
    if (url) {
      Linking.openURL(url).catch(() => {
        Alert.alert('Error', 'Unable to open website');
      });
    } else {
      Alert.alert('No Website', 'Website URL not available for this tool');
    }
  };

  const categoryColor = getCategoryColor(tool.category);
  const websiteUrl = tool.url || toolUrls[tool.name];

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

        {websiteUrl && (
          <TouchableOpacity
            style={[styles.websiteButton, { backgroundColor: categoryColor }]}
            onPress={handleOpenWebsite}
            activeOpacity={0.8}
          >
            <IconSymbol name="arrow.up.right" size={20} color="#fff" />
            <ThemedText style={styles.websiteButtonText}>Open Website</ThemedText>
          </TouchableOpacity>
        )}

        {toolGoals.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <IconSymbol name="target" size={22} color={colors.tint} />
              <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>
                Recommended For
              </ThemedText>
            </View>
            <View style={styles.goalChipsContainer}>
              {toolGoals.map(goal => (
                <TouchableOpacity
                  key={goal.id}
                  style={[styles.goalChip, { backgroundColor: goal.color + '20', borderColor: goal.color + '40' }]}
                  onPress={() => router.push(`/goal/${goal.id}`)}
                  activeOpacity={0.7}
                >
                  <IconSymbol name={goal.icon as any} size={18} color={goal.color} />
                  <ThemedText style={[styles.goalChipText, { color: goal.color }]}>{goal.title}</ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {relatedLevers.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <IconSymbol name="slider.horizontal.3" size={22} color={colors.tint} />
              <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>
                Related Strategic Levers
              </ThemedText>
            </View>
            {relatedLevers.map(({ lever, goal }) => (
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
                    <ThemedText style={[styles.leverTitle, { color: colors.text }]}>{lever.title}</ThemedText>
                    <ThemedText style={[styles.leverGoalName, { color: goal.color }]}>{goal.title}</ThemedText>
                  </View>
                  <IconSymbol name="chevron.right" size={18} color={colors.textSecondary} />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <IconSymbol name="lightbulb.fill" size={22} color={'#F59E0B'} />
            <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>
              Key Features
            </ThemedText>
          </View>
          <View style={[styles.featuresCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.featureItem}>
              <View style={[styles.featureDot, { backgroundColor: colors.tint }]} />
              <ThemedText style={[styles.featureText, { color: colors.text }]}>
                {tool.category} specialized solution
              </ThemedText>
            </View>
            <View style={styles.featureItem}>
              <View style={[styles.featureDot, { backgroundColor: colors.success }]} />
              <ThemedText style={[styles.featureText, { color: colors.text }]}>
                Enterprise-grade security and compliance
              </ThemedText>
            </View>
            <View style={styles.featureItem}>
              <View style={[styles.featureDot, { backgroundColor: colors.warning }]} />
              <ThemedText style={[styles.featureText, { color: colors.text }]}>
                Seamless integration capabilities
              </ThemedText>
            </View>
            <View style={styles.featureItem}>
              <View style={[styles.featureDot, { backgroundColor: '#8B5CF6' }]} />
              <ThemedText style={[styles.featureText, { color: colors.text }]}>
                AI-powered automation features
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
  bottomPadding: {
    height: 40,
  },
});
