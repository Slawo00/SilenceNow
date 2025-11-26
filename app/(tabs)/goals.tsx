import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { goals } from '@/data/goals';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function GoalsScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const router = useRouter();
  const colors = Colors[colorScheme];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <ThemedText style={styles.title}>Optimierungsziele</ThemedText>
          <ThemedText style={[styles.subtitle, { color: colors.textSecondary }]}>
            4 strategische Ziele für Ihren Monatsabschluss
          </ThemedText>
        </View>

        {goals.map((goal, index) => (
          <TouchableOpacity
            key={goal.id}
            style={[styles.goalCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => router.push(`/goal/${goal.id}`)}
            activeOpacity={0.7}
          >
            <View style={styles.goalHeader}>
              <View style={[styles.goalIconContainer, { backgroundColor: goal.color + '20' }]}>
                <IconSymbol name={goal.icon as any} size={32} color={goal.color} />
              </View>
              <View style={styles.goalInfo}>
                <ThemedText style={styles.goalTitle}>{goal.title}</ThemedText>
                <ThemedText style={[styles.goalDescription, { color: colors.textSecondary }]}>
                  {goal.description}
                </ThemedText>
              </View>
              <IconSymbol name="chevron.right" size={20} color={colors.icon} />
            </View>

            <View style={[styles.leversBadge, { backgroundColor: goal.color + '15' }]}>
              <IconSymbol name="slider.horizontal.3" size={16} color={goal.color} />
              <ThemedText style={[styles.leversText, { color: goal.color }]}>
                {goal.levers.length} strategische Hebel
              </ThemedText>
            </View>

            <View style={styles.leverPreview}>
              {goal.levers.slice(0, 3).map((lever, idx) => (
                <View key={lever.id} style={styles.leverPreviewItem}>
                  <View style={[styles.leverDot, { backgroundColor: goal.color }]} />
                  <ThemedText style={[styles.leverPreviewText, { color: colors.textSecondary }]} numberOfLines={1}>
                    {lever.title}
                  </ThemedText>
                </View>
              ))}
              {goal.levers.length > 3 && (
                <ThemedText style={[styles.moreLevers, { color: colors.tint }]}>
                  +{goal.levers.length - 3} weitere Hebel
                </ThemedText>
              )}
            </View>
          </TouchableOpacity>
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
    paddingBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 15,
    marginTop: 8,
    lineHeight: 22,
  },
  goalCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  goalIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalInfo: {
    flex: 1,
    marginLeft: 16,
    marginRight: 8,
  },
  goalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  goalDescription: {
    fontSize: 13,
    marginTop: 4,
    lineHeight: 18,
  },
  leversBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 16,
    gap: 6,
  },
  leversText: {
    fontSize: 13,
    fontWeight: '600',
  },
  leverPreview: {
    marginTop: 16,
    gap: 8,
  },
  leverPreviewItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  leverDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  leverPreviewText: {
    fontSize: 14,
    flex: 1,
  },
  moreLevers: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 4,
    marginLeft: 16,
  },
  bottomPadding: {
    height: 100,
  },
});
