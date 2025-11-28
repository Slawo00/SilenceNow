import { ScrollView, StyleSheet, TouchableOpacity, View, TextInput } from 'react-native';
import { useState, useMemo } from 'react';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { getAllAITools, getToolCategories, goals } from '@/data/goals';
import { SafeAreaView } from 'react-native-safe-area-context';
import GlobalHeader from '@/components/GlobalHeader';

const goalFilters = [
  { id: 'speed', name: 'Speed', color: '#00D4AA' },
  { id: 'quality', name: 'Quality & Accuracy', color: '#10B981' },
  { id: 'automation', name: 'Automation', color: '#F59E0B' },
  { id: 'compliance', name: 'Compliance & Governance', color: '#6366F1' },
];

export default function ToolsScreen() {
  const router = useRouter();
  const colors = Colors.dark;
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);

  const allTools = getAllAITools();
  const categories = getToolCategories();

  const getToolGoals = (toolName: string) => {
    const toolGoals: string[] = [];
    goals.forEach(goal => {
      goal.levers.forEach(lever => {
        lever.aiTools.forEach(tool => {
          if (tool.name === toolName && !toolGoals.includes(goal.id)) {
            toolGoals.push(goal.id);
          }
        });
      });
    });
    return toolGoals;
  };

  const filteredTools = useMemo(() => {
    return allTools.filter((tool) => {
      const matchesSearch = tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = !selectedCategory || tool.category === selectedCategory;
      const matchesGoal = !selectedGoal || getToolGoals(tool.name).includes(selectedGoal);
      return matchesSearch && matchesCategory && matchesGoal;
    });
  }, [allTools, searchQuery, selectedCategory, selectedGoal]);

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
      'Risk': '#EF4444',
      'Analytics': '#3B82F6',
      'AI/ML': '#7C3AED',
      'NLG': '#EC4899',
      'Data Provider': '#64748B',
      'Data Management': '#059669',
      'Process Intelligence': '#8B5CF6',
      'Security': '#EF4444',
      'Compliance': '#3B82F6',
      'IC Management': '#10B981',
      'Reporting': '#F59E0B',
      'AI Reporting': '#8B5CF6',
      'Automation': '#6366F1',
      'AP Automation': '#A855F7',
    };
    return categoryColors[category] || colors.tint;
  };

  const handleToolPress = (toolName: string) => {
    router.push(`/tool/${encodeURIComponent(toolName)}`);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <GlobalHeader showLogo />
      
      <View style={styles.header}>
        <ThemedText style={[styles.title, { color: colors.text }]}>AI Tools</ThemedText>
        <ThemedText style={[styles.subtitle, { color: colors.textSecondary }]}>
          {allTools.length} recommended tools for your month-end close
        </ThemedText>
      </View>

      <View style={[styles.searchContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <IconSymbol name="magnifyingglass" size={20} color={colors.icon} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search tools..."
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <IconSymbol name="xmark.circle.fill" size={20} color={colors.icon} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.filterSection}>
        <ThemedText style={[styles.filterLabel, { color: colors.textSecondary }]}>Filter by Goal:</ThemedText>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.goalFiltersContainer}
        >
          {goalFilters.map((goal) => (
            <TouchableOpacity
              key={goal.id}
              style={[
                styles.goalChip,
                {
                  backgroundColor: selectedGoal === goal.id ? goal.color : colors.card,
                  borderColor: selectedGoal === goal.id ? goal.color : colors.border,
                },
              ]}
              onPress={() => setSelectedGoal(selectedGoal === goal.id ? null : goal.id)}
            >
              <ThemedText
                style={[styles.goalChipText, { color: selectedGoal === goal.id ? '#fff' : colors.text }]}
              >
                {goal.name}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesScroll}
        contentContainerStyle={styles.categoriesContainer}
      >
        <TouchableOpacity
          style={[
            styles.categoryChip,
            { backgroundColor: !selectedCategory ? colors.tint : colors.card, borderColor: colors.border },
          ]}
          onPress={() => setSelectedCategory(null)}
        >
          <ThemedText style={[styles.categoryText, { color: !selectedCategory ? '#fff' : colors.text }]}>
            All Categories
          </ThemedText>
        </TouchableOpacity>
        {categories.map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryChip,
              {
                backgroundColor: selectedCategory === category ? getCategoryColor(category) : colors.card,
                borderColor: colors.border,
              },
            ]}
            onPress={() => setSelectedCategory(selectedCategory === category ? null : category)}
          >
            <ThemedText
              style={[styles.categoryText, { color: selectedCategory === category ? '#fff' : colors.text }]}
            >
              {category}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.toolsList}>
        <ThemedText style={[styles.resultsCount, { color: colors.textSecondary }]}>
          {filteredTools.length} Tool{filteredTools.length !== 1 ? 's' : ''} found
        </ThemedText>

        {filteredTools.map((tool, index) => {
          const toolGoals = getToolGoals(tool.name);
          return (
            <TouchableOpacity
              key={`${tool.name}-${index}`}
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
              
              <View style={styles.toolMeta}>
                <View style={[styles.toolCategory, { backgroundColor: getCategoryColor(tool.category) + '15' }]}>
                  <ThemedText style={[styles.toolCategoryText, { color: getCategoryColor(tool.category) }]}>
                    {tool.category}
                  </ThemedText>
                </View>
                {toolGoals.length > 0 && (
                  <View style={styles.goalBadges}>
                    {toolGoals.slice(0, 2).map(goalId => {
                      const goalInfo = goalFilters.find(g => g.id === goalId);
                      return goalInfo ? (
                        <View
                          key={goalId}
                          style={[styles.goalBadge, { backgroundColor: goalInfo.color + '20' }]}
                        >
                          <View style={[styles.goalBadgeDot, { backgroundColor: goalInfo.color }]} />
                        </View>
                      ) : null;
                    })}
                  </View>
                )}
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
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 15,
    marginTop: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    padding: 0,
  },
  filterSection: {
    marginTop: 16,
    paddingHorizontal: 20,
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  goalFiltersContainer: {
    gap: 8,
  },
  goalChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
  },
  goalChipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  categoriesScroll: {
    maxHeight: 50,
    marginTop: 12,
  },
  categoriesContainer: {
    paddingHorizontal: 20,
    gap: 8,
    alignItems: 'center',
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '600',
  },
  toolsList: {
    flex: 1,
    marginTop: 8,
  },
  resultsCount: {
    fontSize: 13,
    paddingHorizontal: 20,
    marginVertical: 12,
  },
  toolCard: {
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
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
  toolMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 8,
  },
  toolCategory: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
  },
  toolCategoryText: {
    fontSize: 12,
    fontWeight: '600',
  },
  goalBadges: {
    flexDirection: 'row',
    gap: 6,
  },
  goalBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalBadgeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  bottomPadding: {
    height: 100,
  },
});
