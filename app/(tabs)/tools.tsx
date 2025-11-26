import { ScrollView, StyleSheet, TouchableOpacity, View, TextInput } from 'react-native';
import { useState, useMemo } from 'react';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { getAllAITools, getToolCategories } from '@/data/goals';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ToolsScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const allTools = getAllAITools();
  const categories = getToolCategories();

  const filteredTools = useMemo(() => {
    return allTools.filter((tool) => {
      const matchesSearch = tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = !selectedCategory || tool.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [allTools, searchQuery, selectedCategory]);

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
    };
    return categoryColors[category] || colors.tint;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <ThemedText style={styles.title}>KI-Tools</ThemedText>
        <ThemedText style={[styles.subtitle, { color: colors.textSecondary }]}>
          {allTools.length} empfohlene Tools für Ihren Monatsabschluss
        </ThemedText>
      </View>

      <View style={[styles.searchContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <IconSymbol name="magnifyingglass" size={20} color={colors.icon} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Tools durchsuchen..."
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
            Alle
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
          {filteredTools.length} Tool{filteredTools.length !== 1 ? 's' : ''} gefunden
        </ThemedText>

        {filteredTools.map((tool, index) => (
          <View
            key={`${tool.name}-${index}`}
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
    paddingTop: 16,
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
  categoriesScroll: {
    maxHeight: 50,
    marginTop: 16,
  },
  categoriesContainer: {
    paddingHorizontal: 20,
    gap: 8,
    alignItems: 'center',
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
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
    height: 100,
  },
});
