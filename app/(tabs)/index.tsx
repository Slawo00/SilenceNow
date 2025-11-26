import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
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
    { label: 'Ziele', value: '4', icon: 'target' as const },
    { label: 'Hebel', value: '40', icon: 'slider.horizontal.3' as const },
    { label: 'KI-Tools', value: '80+', icon: 'cpu' as const },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <ThemedText style={styles.logo}>Sigma</ThemedText>
          <ThemedText style={[styles.logoAccent, { color: colors.tint }]}>FinanceAI</ThemedText>
        </View>

        <ThemedText style={[styles.subtitle, { color: colors.textSecondary }]}>
          Finance Coaching für CFOs
        </ThemedText>

        <View style={styles.statsContainer}>
          {stats.map((stat, index) => (
            <View
              key={index}
              style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <IconSymbol name={stat.icon} size={24} color={colors.tint} />
              <ThemedText style={styles.statValue}>{stat.value}</ThemedText>
              <ThemedText style={[styles.statLabel, { color: colors.textSecondary }]}>
                {stat.label}
              </ThemedText>
            </View>
          ))}
        </View>

        <ThemedText style={styles.sectionTitle}>Optimierungsziele</ThemedText>

        <View style={styles.goalsGrid}>
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
              <ThemedText style={styles.goalTitle}>{goal.title}</ThemedText>
              <ThemedText style={[styles.goalLevers, { color: colors.textSecondary }]}>
                {goal.levers.length} Hebel
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>

        <View style={[styles.infoCard, { backgroundColor: colors.tint + '15', borderColor: colors.tint + '30' }]}>
          <IconSymbol name="lightbulb.fill" size={24} color={colors.tint} />
          <View style={styles.infoContent}>
            <ThemedText style={styles.infoTitle}>Tipp des Tages</ThemedText>
            <ThemedText style={[styles.infoText, { color: colors.textSecondary }]}>
              Beginnen Sie mit dem Hebel "Automatisierte Kontenabstimmung" - er bietet den schnellsten ROI mit mittlerem Implementierungsaufwand.
            </ThemedText>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  logo: {
    fontSize: 32,
    fontWeight: '800',
  },
  logoAccent: {
    fontSize: 32,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 16,
    paddingHorizontal: 20,
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: 24,
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    paddingHorizontal: 20,
    marginTop: 32,
    marginBottom: 16,
  },
  goalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 14,
    gap: 12,
  },
  goalCard: {
    width: '47%',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  goalIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  goalLevers: {
    fontSize: 13,
    marginTop: 4,
  },
  infoCard: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 24,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 13,
    lineHeight: 18,
  },
  bottomPadding: {
    height: 100,
  },
});
