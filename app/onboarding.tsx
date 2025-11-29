import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View, Text, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useOnboarding } from '@/context/OnboardingContext';
import { goals } from '@/data/goals';

type Step = 1 | 2 | 3;

const companySizes = [
  { id: 'small', label: 'Small', description: 'Up to 100 employees' },
  { id: 'midsize', label: 'Mid-size', description: '100-1,000 employees' },
  { id: 'large', label: 'Large', description: '1,000+ employees' },
];

const closeDurations = [
  { days: 3, label: '1-3 days' },
  { days: 5, label: '4-5 days' },
  { days: 7, label: '6-7 days' },
  { days: 10, label: '8-10 days' },
  { days: 15, label: '11-15 days' },
  { days: 20, label: '15+ days' },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const { completeOnboarding } = useOnboarding();
  const colors = Colors.dark;

  const [step, setStep] = useState<Step>(1);
  const [primaryGoal, setPrimaryGoal] = useState<string>('');
  const [companySize, setCompanySize] = useState<string>('');
  const [closeDuration, setCloseDuration] = useState<number>(0);

  const handleNext = async () => {
    if (step < 3) {
      setStep((step + 1) as Step);
    } else {
      await completeOnboarding({
        primaryGoal,
        companySize,
        closeDuration,
        completedAt: new Date().toISOString(),
      });
      router.replace(`/goal/${primaryGoal}`);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep((step - 1) as Step);
    }
  };

  const handleSkip = () => {
    router.replace('/(tabs)');
  };

  const canProceed = () => {
    if (step === 1) return primaryGoal !== '';
    if (step === 2) return companySize !== '';
    if (step === 3) return closeDuration > 0;
    return false;
  };

  const getGoalIcon = (icon: string) => {
    return icon as any;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <View style={styles.progressContainer}>
          {[1, 2, 3].map((s) => (
            <View
              key={s}
              style={[
                styles.progressDot,
                { backgroundColor: s <= step ? colors.tint : colors.border },
              ]}
            />
          ))}
        </View>
        <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
          <Text style={[styles.skipText, { color: colors.textSecondary }]}>Skip</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        {step === 1 && (
          <View style={styles.stepContent}>
            <View style={[styles.stepBadge, { backgroundColor: colors.tint + '20' }]}>
              <Text style={[styles.stepBadgeText, { color: colors.tint }]}>Step 1 of 3</Text>
            </View>
            <Text style={[styles.title, { color: colors.text }]}>
              What is your primary optimization goal?
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Select the area where you want to focus your finance transformation
            </Text>

            <View style={styles.optionsGrid}>
              {goals.map((goal) => (
                <TouchableOpacity
                  key={goal.id}
                  style={[
                    styles.goalOption,
                    { 
                      backgroundColor: colors.card, 
                      borderColor: primaryGoal === goal.id ? goal.color : colors.border,
                      borderWidth: primaryGoal === goal.id ? 2 : 1,
                    },
                  ]}
                  onPress={() => setPrimaryGoal(goal.id)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.goalIcon, { backgroundColor: goal.color + '20' }]}>
                    <IconSymbol name={getGoalIcon(goal.icon)} size={28} color={goal.color} />
                  </View>
                  <Text style={[styles.goalTitle, { color: colors.text }]}>{goal.title}</Text>
                  <Text style={[styles.goalDesc, { color: colors.textSecondary }]} numberOfLines={2}>
                    {goal.description}
                  </Text>
                  {primaryGoal === goal.id && (
                    <View style={[styles.selectedBadge, { backgroundColor: goal.color }]}>
                      <IconSymbol name="checkmark.circle.fill" size={16} color="#fff" />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {step === 2 && (
          <View style={styles.stepContent}>
            <View style={[styles.stepBadge, { backgroundColor: colors.tint + '20' }]}>
              <Text style={[styles.stepBadgeText, { color: colors.tint }]}>Step 2 of 3</Text>
            </View>
            <Text style={[styles.title, { color: colors.text }]}>
              What is your company size?
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              This helps us tailor recommendations to your organization
            </Text>

            <View style={styles.sizeOptions}>
              {companySizes.map((size) => (
                <TouchableOpacity
                  key={size.id}
                  style={[
                    styles.sizeOption,
                    { 
                      backgroundColor: colors.card, 
                      borderColor: companySize === size.id ? colors.tint : colors.border,
                      borderWidth: companySize === size.id ? 2 : 1,
                    },
                  ]}
                  onPress={() => setCompanySize(size.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.sizeContent}>
                    <Text style={[styles.sizeLabel, { color: colors.text }]}>{size.label}</Text>
                    <Text style={[styles.sizeDesc, { color: colors.textSecondary }]}>{size.description}</Text>
                  </View>
                  {companySize === size.id && (
                    <IconSymbol name="checkmark.circle.fill" size={24} color={colors.tint} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {step === 3 && (
          <View style={styles.stepContent}>
            <View style={[styles.stepBadge, { backgroundColor: colors.tint + '20' }]}>
              <Text style={[styles.stepBadgeText, { color: colors.tint }]}>Step 3 of 3</Text>
            </View>
            <Text style={[styles.title, { color: colors.text }]}>
              How long is your current month-end close?
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              This helps us measure your optimization potential
            </Text>

            <View style={styles.durationOptions}>
              {closeDurations.map((duration) => (
                <TouchableOpacity
                  key={duration.days}
                  style={[
                    styles.durationOption,
                    { 
                      backgroundColor: closeDuration === duration.days ? colors.tint : colors.card,
                      borderColor: closeDuration === duration.days ? colors.tint : colors.border,
                    },
                  ]}
                  onPress={() => setCloseDuration(duration.days)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.durationText,
                      { color: closeDuration === duration.days ? '#fff' : colors.text },
                    ]}
                  >
                    {duration.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: colors.background }]}>
        {step > 1 && (
          <TouchableOpacity
            style={[styles.backBtn, { borderColor: colors.border }]}
            onPress={handleBack}
          >
            <IconSymbol name="chevron.left" size={20} color={colors.text} />
            <Text style={[styles.backBtnText, { color: colors.text }]}>Back</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[
            styles.nextBtn,
            { 
              backgroundColor: canProceed() ? colors.tint : colors.border,
              marginLeft: step === 1 ? 0 : 12,
              flex: step === 1 ? 1 : undefined,
            },
          ]}
          onPress={handleNext}
          disabled={!canProceed()}
        >
          <Text style={[styles.nextBtnText, { color: canProceed() ? '#fff' : colors.textSecondary }]}>
            {step === 3 ? 'Get Started' : 'Continue'}
          </Text>
          {step < 3 && (
            <IconSymbol name="chevron.right" size={20} color={canProceed() ? '#fff' : colors.textSecondary} />
          )}
        </TouchableOpacity>
      </View>
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
    paddingVertical: 16,
  },
  progressContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  progressDot: {
    width: 32,
    height: 4,
    borderRadius: 2,
  },
  skipButton: {
    padding: 8,
  },
  skipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  stepContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  stepBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 16,
  },
  stepBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    lineHeight: 36,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 32,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  goalOption: {
    width: '47%',
    padding: 16,
    borderRadius: 16,
    position: 'relative',
  },
  goalIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  goalTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 6,
  },
  goalDesc: {
    fontSize: 12,
    lineHeight: 16,
  },
  selectedBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sizeOptions: {
    gap: 12,
  },
  sizeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
  },
  sizeContent: {
    flex: 1,
  },
  sizeLabel: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  sizeDesc: {
    fontSize: 14,
  },
  durationOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  durationOption: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  durationText: {
    fontSize: 15,
    fontWeight: '600',
  },
  bottomPadding: {
    height: 100,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 32,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 4,
  },
  backBtnText: {
    fontSize: 16,
    fontWeight: '600',
  },
  nextBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 6,
  },
  nextBtnText: {
    fontSize: 16,
    fontWeight: '700',
  },
});
