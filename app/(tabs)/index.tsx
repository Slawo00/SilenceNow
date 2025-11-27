import { ScrollView, StyleSheet, TouchableOpacity, View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { goals } from '@/data/goals';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function DashboardScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const router = useRouter();
  const colors = Colors[colorScheme];

  const stats = [
    { label: 'GOALS', value: '4' },
    { label: 'STRATEGIC LEVERS', value: '40' },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Text style={[styles.sigmaSymbol, { color: colors.text }]}>Σ</Text>
            <View style={styles.logoTextContainer}>
              <View style={styles.logoRow}>
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

        <View style={styles.statsContainer}>
          {stats.map((stat, index) => (
            <View key={index} style={styles.statItem}>
              <ThemedText style={[styles.statValue, { color: colors.tint }]}>{stat.value}</ThemedText>
              <ThemedText style={[styles.statLabel, { color: colors.textSecondary }]}>
                {stat.label}
              </ThemedText>
            </View>
          ))}
        </View>

        <View style={[styles.toolsHighlight, { borderColor: colors.tint }]}>
          <ThemedText style={[styles.toolsValue, { color: colors.tint }]}>50+</ThemedText>
          <ThemedText style={[styles.toolsLabel, { color: colors.textSecondary }]}>
            RECOMMENDED TOOLS
          </ThemedText>
        </View>

        <ThemedText style={styles.sectionTitle}>Select Your Optimization Goal</ThemedText>

        <View style={styles.goalsContainer}>
          {goals.map((goal) => (
            <TouchableOpacity
              key={goal.id}
              style={[styles.goalCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => router.push(`/goal/${goal.id}`)}
              activeOpacity={0.7}
            >
              <View style={[styles.goalIconContainer, { backgroundColor: goal.color + '20' }]}>
                <IconSymbol name={goal.icon as any} size={32} color={goal.color} />
              </View>
              <ThemedText style={styles.goalTitle}>{goal.title}</ThemedText>
              <ThemedText style={[styles.goalDescription, { color: colors.textSecondary }]} numberOfLines={2}>
                {goal.description}
              </ThemedText>
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
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sigmaSymbol: {
    fontSize: 48,
    fontWeight: '300',
    marginRight: 12,
  },
  logoTextContainer: {
    flex: 1,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  logoText: {
    fontSize: 24,
    fontWeight: '700',
  },
  logoAccent: {
    fontSize: 24,
    fontWeight: '700',
  },
  tagline: {
    fontSize: 11,
    letterSpacing: 2,
    marginTop: 2,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: 8,
    gap: 32,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 36,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 11,
    letterSpacing: 1,
    marginTop: 4,
  },
  toolsHighlight: {
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 24,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
  },
  toolsValue: {
    fontSize: 42,
    fontWeight: '700',
  },
  toolsLabel: {
    fontSize: 11,
    letterSpacing: 1,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    paddingHorizontal: 20,
    marginTop: 32,
    marginBottom: 20,
    textAlign: 'center',
  },
  goalsContainer: {
    paddingHorizontal: 20,
    gap: 16,
  },
  goalCard: {
    padding: 24,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
  },
  goalIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  goalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  goalDescription: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  bottomPadding: {
    height: 100,
  },
});
