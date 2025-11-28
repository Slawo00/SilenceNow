import React from 'react';
import { ScrollView, StyleSheet, View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import GlobalHeader from '@/components/GlobalHeader';

const steps = [
  {
    number: 1,
    title: 'Complete Onboarding',
    description: 'Tell us about your organization, primary optimization goals, and current close process duration. This helps us personalize your experience.',
    icon: 'person.crop.circle.fill',
  },
  {
    number: 2,
    title: 'Explore Optimization Goals',
    description: 'Browse through our 4 optimization areas: Speed (Fast Close), Quality & Accuracy, Automation, and Compliance & Governance.',
    icon: 'target',
  },
  {
    number: 3,
    title: 'Discover Strategic Levers',
    description: 'Each goal contains 10 proven strategic levers with detailed implementation guides, benefits analysis, and AI tool recommendations.',
    icon: 'slider.horizontal.3',
  },
  {
    number: 4,
    title: 'Build Your Plan',
    description: 'Add levers to your personal optimization plan. Track progress as you move from "Planned" to "In Progress" to "Done".',
    icon: 'checklist',
  },
  {
    number: 5,
    title: 'Leverage AI Tools',
    description: 'Explore recommended AI tools for each lever. Access detailed information, features, and direct links to vendor websites.',
    icon: 'cpu',
  },
  {
    number: 6,
    title: 'Transform Your Finance Function',
    description: 'Implement changes systematically, measure improvements with KPIs, and achieve finance excellence through AI and automation.',
    icon: 'chart.line.uptrend.xyaxis',
  },
];

export default function HowItWorksScreen() {
  const colors = Colors.dark;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <GlobalHeader title="How It Works" showBack />
      
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={[styles.pageTitle, { color: colors.text }]}>
            Your Journey to Finance Excellence
          </Text>
          <Text style={[styles.pageSubtitle, { color: colors.textSecondary }]}>
            SigmaFinanceAI guides you through a structured approach to optimizing your month-end close process.
          </Text>

          <View style={styles.stepsContainer}>
            {steps.map((step, index) => (
              <View key={step.number} style={styles.stepWrapper}>
                <View style={[styles.stepCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <View style={[styles.stepNumber, { backgroundColor: colors.tint }]}>
                    <Text style={styles.stepNumberText}>{step.number}</Text>
                  </View>
                  <View style={styles.stepContent}>
                    <View style={styles.stepHeader}>
                      <IconSymbol name={step.icon as any} size={24} color={colors.tint} />
                      <Text style={[styles.stepTitle, { color: colors.text }]}>{step.title}</Text>
                    </View>
                    <Text style={[styles.stepDescription, { color: colors.textSecondary }]}>
                      {step.description}
                    </Text>
                  </View>
                </View>
                {index < steps.length - 1 && (
                  <View style={[styles.connector, { backgroundColor: colors.tint + '40' }]} />
                )}
              </View>
            ))}
          </View>

          <View style={[styles.infoCard, { backgroundColor: colors.tint + '15', borderColor: colors.tint + '30' }]}>
            <IconSymbol name="lightbulb.fill" size={24} color={colors.tint} />
            <View style={styles.infoContent}>
              <Text style={[styles.infoTitle, { color: colors.tint }]}>Pro Tip</Text>
              <Text style={[styles.infoText, { color: colors.text }]}>
                Start with the optimization goal that aligns with your most pressing business need. Focus on a few high-impact levers first before expanding your plan.
              </Text>
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
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 12,
  },
  pageSubtitle: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 32,
  },
  stepsContainer: {
    marginBottom: 32,
  },
  stepWrapper: {
    marginBottom: 16,
  },
  stepCard: {
    flexDirection: 'row',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'flex-start',
  },
  stepNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  stepContent: {
    flex: 1,
    marginLeft: 16,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 10,
  },
  stepTitle: {
    fontSize: 17,
    fontWeight: '700',
    flex: 1,
  },
  stepDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  connector: {
    width: 3,
    height: 16,
    marginLeft: 36,
    borderRadius: 2,
  },
  infoCard: {
    flexDirection: 'row',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'flex-start',
    gap: 14,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 6,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
  },
  bottomPadding: {
    height: 100,
  },
});
