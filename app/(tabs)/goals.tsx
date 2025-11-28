import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { goals } from '@/data/goals';
import { SafeAreaView } from 'react-native-safe-area-context';
import GlobalHeader from '@/components/GlobalHeader';

export default function GoalsScreen() {
  const router = useRouter();
  const colors = Colors.dark;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <GlobalHeader showLogo />

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.titleSection}>
          <ThemedText style={[styles.pageTitle, { color: colors.text }]}>Optimization Goals</ThemedText>
          <ThemedText style={[styles.pageSubtitle, { color: colors.textSecondary }]}>
            Select a goal to view strategic levers and implementation guides
          </ThemedText>
        </View>

        {goals.map((goal) => (
          <TouchableOpacity
            key={goal.id}
            style={[styles.goalCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => router.push(`/goal/${goal.id}`)}
            activeOpacity={0.7}
          >
            <View style={[styles.goalIconContainer, { backgroundColor: goal.color + '20' }]}>
              <IconSymbol name={goal.icon as any} size={28} color={goal.color} />
            </View>
            <View style={styles.goalContent}>
              <ThemedText style={[styles.goalTitle, { color: colors.text }]}>{goal.title}</ThemedText>
              <ThemedText style={[styles.goalDescription, { color: colors.textSecondary }]}>
                {goal.description}
              </ThemedText>
              <View style={[styles.leversBadge, { backgroundColor: goal.color + '15' }]}>
                <ThemedText style={[styles.leversText, { color: goal.color }]}>
                  {goal.levers.length} Strategic Levers
                </ThemedText>
              </View>
            </View>
            <IconSymbol name="chevron.right" size={20} color={colors.textSecondary} />
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
  titleSection: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
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
  goalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 16,
  },
  goalIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalContent: {
    flex: 1,
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  goalDescription: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 8,
  },
  leversBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  leversText: {
    fontSize: 11,
    fontWeight: '600',
  },
  bottomPadding: {
    height: 100,
  },
});
