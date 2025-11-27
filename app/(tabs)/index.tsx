import { ScrollView, StyleSheet, TouchableOpacity, View, Image, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { goals } from '@/data/goals';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function DashboardScreen() {
  const colorScheme = useColorScheme() ?? 'dark';
  const router = useRouter();
  const colors = Colors.dark;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Image
              source={require('../../assets/images/logo.png')}
              style={styles.headerLogo}
              resizeMode="contain"
            />
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle}>
                <Text style={styles.headerTitleWhite}>Sigma</Text>
                <Text style={styles.headerTitleWhite}>Finance</Text>
                <Text style={[styles.headerTitleAccent, { color: colors.tint }]}>AI</Text>
              </Text>
              <Text style={[styles.headerTagline, { color: colors.textSecondary }]}>
                AI. FINANCE. EXCELLENCE
              </Text>
            </View>
          </View>
          <TouchableOpacity style={[styles.menuButton, { backgroundColor: colors.card }]}>
            <IconSymbol name="list.bullet" size={20} color={colors.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.heroSection}>
          <View style={[styles.badge, { backgroundColor: colors.card }]}>
            <View style={[styles.badgeDot, { backgroundColor: colors.tint }]} />
            <Text style={[styles.badgeText, { color: colors.tint }]}>AI. FINANCE. EXCELLENCE</Text>
          </View>

          <Text style={styles.heroTitle}>
            <Text style={{ color: colors.text }}>Transforming{'\n'}Finance with </Text>
            <Text style={{ color: colors.tint }}>AI</Text>
            <Text style={{ color: colors.text }}> &{'\n'}Automation</Text>
          </Text>

          <Text style={[styles.heroSubtitle, { color: colors.textSecondary }]}>
            Select your optimization goal to receive ten proven strategies with detailed implementation guidance and recommended tools
          </Text>
        </View>

        <View style={styles.goalsContainer}>
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
                <ThemedText style={[styles.goalDescription, { color: colors.textSecondary }]} numberOfLines={2}>
                  {goal.description}
                </ThemedText>
              </View>
              <IconSymbol name="chevron.right" size={20} color={colors.textSecondary} />
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerLogo: {
    width: 44,
    height: 44,
  },
  headerTextContainer: {
    gap: 2,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  headerTitleWhite: {
    color: '#F1F5F9',
  },
  headerTitleAccent: {
    fontWeight: '700',
  },
  headerTagline: {
    fontSize: 10,
    letterSpacing: 1,
  },
  menuButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroSection: {
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 40,
    alignItems: 'center',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    gap: 8,
    marginBottom: 32,
  },
  badgeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
  },
  heroTitle: {
    fontSize: 38,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 48,
    marginBottom: 24,
  },
  heroSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 26,
    paddingHorizontal: 10,
  },
  goalsContainer: {
    paddingHorizontal: 20,
    gap: 12,
  },
  goalCard: {
    flexDirection: 'row',
    alignItems: 'center',
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
  },
  bottomPadding: {
    height: 100,
  },
});
