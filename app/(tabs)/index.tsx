import { ScrollView, StyleSheet, TouchableOpacity, View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { goals } from '@/data/goals';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useOnboarding } from '@/context/OnboardingContext';
import GlobalHeader from '@/components/GlobalHeader';

const valuePropositions = [
  { icon: 'timer', text: 'Reduce month-end close time' },
  { icon: 'checkmark.circle.fill', text: 'Improve data accuracy' },
  { icon: 'cpu', text: 'Leverage AI-powered tools' },
  { icon: 'doc.text.fill', text: 'Build your optimization roadmap' },
];

const howItWorks = [
  {
    step: 1,
    title: 'Choose Your Goal',
    description: 'Select from 4 optimization areas: Speed, Quality, Automation, or Compliance',
  },
  {
    step: 2,
    title: 'Explore Strategic Levers',
    description: 'Discover 10 proven strategies for each goal with implementation guides',
  },
  {
    step: 3,
    title: 'Build Your Plan',
    description: 'Add levers to your plan and track progress on your transformation journey',
  },
];

export default function DashboardScreen() {
  const router = useRouter();
  const colors = Colors.dark;
  const { isOnboardingCompleted, onboardingData } = useOnboarding();

  const recommendedGoal = onboardingData?.primaryGoal
    ? goals.find(g => g.id === onboardingData.primaryGoal)
    : null;

  const handleGetStarted = () => {
    if (isOnboardingCompleted) {
      router.push('/(tabs)/goals');
    } else {
      router.push('/onboarding');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <GlobalHeader showLogo />

      <ScrollView showsVerticalScrollIndicator={false}>
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
            Your CFO coaching companion for optimizing the month-end close process
          </Text>

          <TouchableOpacity
            style={[styles.ctaButton, { backgroundColor: colors.tint }]}
            onPress={handleGetStarted}
            activeOpacity={0.8}
          >
            <Text style={styles.ctaButtonText}>
              {isOnboardingCompleted ? 'View Goals' : 'Get Started'}
            </Text>
            <IconSymbol name="chevron.right" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.valueSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Key Benefits</Text>
          <View style={styles.valueGrid}>
            {valuePropositions.map((item, index) => (
              <View
                key={index}
                style={[styles.valueCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              >
                <View style={[styles.valueIcon, { backgroundColor: colors.tint + '20' }]}>
                  <IconSymbol name={item.icon as any} size={22} color={colors.tint} />
                </View>
                <Text style={[styles.valueText, { color: colors.text }]}>{item.text}</Text>
              </View>
            ))}
          </View>
        </View>

        {recommendedGoal && (
          <View style={[styles.recommendedSection, { backgroundColor: recommendedGoal.color + '10', borderColor: recommendedGoal.color + '30' }]}>
            <View style={styles.recommendedHeader}>
              <View style={[styles.recommendedIcon, { backgroundColor: recommendedGoal.color + '25' }]}>
                <IconSymbol name={recommendedGoal.icon as any} size={24} color={recommendedGoal.color} />
              </View>
              <View style={styles.recommendedContent}>
                <Text style={[styles.recommendedLabel, { color: colors.textSecondary }]}>
                  Based on your onboarding
                </Text>
                <Text style={[styles.recommendedTitle, { color: recommendedGoal.color }]}>
                  {recommendedGoal.title}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={[styles.recommendedBtn, { backgroundColor: recommendedGoal.color }]}
              onPress={() => router.push(`/goal/${recommendedGoal.id}`)}
            >
              <Text style={styles.recommendedBtnText}>Start Here</Text>
              <IconSymbol name="chevron.right" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.howItWorksSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>How It Works</Text>
          {howItWorks.map((item, index) => (
            <View
              key={item.step}
              style={[styles.stepCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <View style={[styles.stepNumber, { backgroundColor: colors.tint }]}>
                <Text style={styles.stepNumberText}>{item.step}</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={[styles.stepTitle, { color: colors.text }]}>{item.title}</Text>
                <Text style={[styles.stepDescription, { color: colors.textSecondary }]}>
                  {item.description}
                </Text>
              </View>
              {index < howItWorks.length - 1 && (
                <View style={[styles.stepConnector, { backgroundColor: colors.border }]} />
              )}
            </View>
          ))}
        </View>

        <View style={styles.goalsSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Optimization Goals</Text>
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
  heroSection: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 32,
    alignItems: 'center',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    gap: 8,
    marginBottom: 24,
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
    fontSize: 36,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 44,
    marginBottom: 16,
  },
  heroSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 10,
    marginBottom: 24,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 14,
    gap: 8,
  },
  ctaButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  valueSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  valueGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  valueCard: {
    width: '47%',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  valueIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  valueText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
  recommendedSection: {
    marginHorizontal: 20,
    marginBottom: 32,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
  },
  recommendedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  recommendedIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recommendedContent: {
    flex: 1,
    marginLeft: 14,
  },
  recommendedLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  recommendedTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  recommendedBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 6,
  },
  recommendedBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  howItWorksSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  stepCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 12,
    position: 'relative',
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  stepContent: {
    flex: 1,
    marginLeft: 14,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  stepConnector: {
    position: 'absolute',
    left: 31,
    bottom: -12,
    width: 2,
    height: 12,
  },
  goalsSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  goalsContainer: {
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
