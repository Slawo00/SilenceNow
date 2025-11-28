import React from 'react';
import { ScrollView, StyleSheet, View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import GlobalHeader from '@/components/GlobalHeader';

const sections = [
  {
    title: 'Data Collection',
    icon: 'doc.text.magnifyingglass',
    content: 'SigmaFinanceAI collects minimal data to provide a personalized experience. This includes your onboarding preferences (optimization goals, company size, close duration) and your personal optimization plan. All data is stored locally on your device using secure storage.',
  },
  {
    title: 'Data Storage',
    icon: 'lock.shield.fill',
    content: 'Your data is stored locally on your device using AsyncStorage. We do not transmit your personal data or plan information to external servers. Your optimization journey remains private and under your control.',
  },
  {
    title: 'Third-Party Links',
    icon: 'link',
    content: 'The app contains links to third-party AI tool vendors. When you access these external websites, their respective privacy policies apply. We recommend reviewing their policies before sharing any information.',
  },
  {
    title: 'Analytics',
    icon: 'chart.bar.fill',
    content: 'We may collect anonymous usage analytics to improve the app experience. This data is aggregated and cannot be used to identify individual users. You can opt out of analytics in your device settings.',
  },
  {
    title: 'Data Security',
    icon: 'checkmark.shield.fill',
    content: 'We implement industry-standard security measures to protect your data. The app uses secure storage mechanisms provided by the mobile platform. Regular security audits ensure ongoing protection.',
  },
  {
    title: 'Your Rights',
    icon: 'person.crop.circle.badge.checkmark',
    content: 'You have the right to access, modify, or delete your data at any time. Use the "Restart Onboarding" option to reset your preferences. Clear app data through your device settings to remove all stored information.',
  },
];

export default function PrivacyScreen() {
  const colors = Colors.dark;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <GlobalHeader title="Data & Privacy" showBack />
      
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={[styles.headerCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.headerIcon, { backgroundColor: colors.tint + '20' }]}>
              <IconSymbol name="hand.raised.fill" size={32} color={colors.tint} />
            </View>
            <Text style={[styles.headerTitle, { color: colors.text }]}>
              Your Privacy Matters
            </Text>
            <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
              We are committed to protecting your data and maintaining your trust.
            </Text>
          </View>

          {sections.map((section, index) => (
            <View 
              key={index} 
              style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <View style={styles.sectionHeader}>
                <View style={[styles.sectionIcon, { backgroundColor: colors.tint + '15' }]}>
                  <IconSymbol name={section.icon as any} size={22} color={colors.tint} />
                </View>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>{section.title}</Text>
              </View>
              <Text style={[styles.sectionContent, { color: colors.textSecondary }]}>
                {section.content}
              </Text>
            </View>
          ))}

          <View style={[styles.updateInfo, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.updateText, { color: colors.textSecondary }]}>
              Last updated: November 2025
            </Text>
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
  headerCard: {
    padding: 28,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: 24,
  },
  headerIcon: {
    width: 72,
    height: 72,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 8,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
  sectionCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  sectionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    flex: 1,
  },
  sectionContent: {
    fontSize: 14,
    lineHeight: 22,
  },
  updateInfo: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    marginTop: 12,
  },
  updateText: {
    fontSize: 13,
  },
  bottomPadding: {
    height: 100,
  },
});
