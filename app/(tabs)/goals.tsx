import { ScrollView, StyleSheet, TouchableOpacity, View, Text } from 'react-native';
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
          <View style={styles.logoRow}>
            <Text style={[styles.sigmaSymbol, { color: colors.text }]}>Σ</Text>
            <View>
              <View style={styles.logoTextRow}>
                <ThemedText style={styles.logoText}>Sigma</ThemedText>
                <ThemedText style={[styles.logoText, { color: colors.tint }]}>Finance</ThemedText>
                <ThemedText style={[styles.logoAccent, { color: colors.tint }]}>AI</ThemedText>
              </View>
              <ThemedText style={[styles.tagline, { color: colors.textSecondary }]}>
                AI. FINANCE. EXCELLENCE
              </ThemedText>
            </View>
          </View>
        </View>

        <ThemedText style={styles.pageTitle}>Optimization Goals</ThemedText>
        <ThemedText style={[styles.pageSubtitle, { color: colors.textSecondary }]}>
          Select a goal to view strategic levers and implementation guides
        </ThemedText>

        {goals.map((goal) => (
          <TouchableOpacity
            key={goal.id}
            style={[styles.goalCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => router.push(`/goal/${goal.id}`)}
            activeOpacity={0.7}
          >
            <View style={[styles.goalIconContainer, { backgroundColor: goal.color + '20' }]}>
              <IconSymbol name={goal.icon as any} size={36} color={goal.color} />
            </View>
            <ThemedText style={styles.goalTitle}>{goal.title}</ThemedText>
            <ThemedText style={[styles.goalDescription, { color: colors.textSecondary }]}>
              {goal.description}
            </ThemedText>
            <View style={[styles.leversBadge, { backgroundColor: goal.color + '15' }]}>
              <ThemedText style={[styles.leversText, { color: goal.color }]}>
                {goal.levers.length} Strategic Levers
              </ThemedText>
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
    paddingBottom: 8,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sigmaSymbol: {
    fontSize: 36,
    fontWeight: '300',
    marginRight: 10,
  },
  logoTextRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  logoText: {
    fontSize: 20,
    fontWeight: '700',
  },
  logoAccent: {
    fontSize: 20,
    fontWeight: '700',
  },
  tagline: {
    fontSize: 9,
    letterSpacing: 1.5,
    marginTop: 2,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '800',
    paddingHorizontal: 20,
    marginTop: 24,
  },
  pageSubtitle: {
    fontSize: 14,
    paddingHorizontal: 20,
    marginTop: 8,
    marginBottom: 24,
    lineHeight: 20,
  },
  goalCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 24,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
  },
  goalIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  goalTitle: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  goalDescription: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  leversBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  leversText: {
    fontSize: 13,
    fontWeight: '600',
  },
  bottomPadding: {
    height: 100,
  },
});
