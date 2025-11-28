import React from 'react';
import { ScrollView, StyleSheet, View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import GlobalHeader from '@/components/GlobalHeader';

const sections = [
  {
    title: '1. Acceptance of Terms',
    content: 'By downloading, installing, or using SigmaFinanceAI, you agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use the application.',
  },
  {
    title: '2. Description of Service',
    content: 'SigmaFinanceAI is a finance coaching application designed to help CFOs and finance leaders optimize their month-end close process. The app provides educational content, strategic frameworks, and AI tool recommendations.',
  },
  {
    title: '3. User Responsibilities',
    content: 'You are responsible for maintaining the confidentiality of your device and any data stored within the app. You agree to use the app only for lawful purposes and in accordance with these terms.',
  },
  {
    title: '4. Intellectual Property',
    content: 'All content, features, and functionality of SigmaFinanceAI, including but not limited to text, graphics, logos, and software, are the exclusive property of SigmaFinanceAI and are protected by international copyright laws.',
  },
  {
    title: '5. Third-Party Links',
    content: 'The app may contain links to third-party websites or services. We are not responsible for the content, privacy policies, or practices of any third-party sites. Access to these links is at your own risk.',
  },
  {
    title: '6. Disclaimer of Warranties',
    content: 'The app is provided "as is" without warranty of any kind. We do not guarantee that the app will be error-free or uninterrupted. The recommendations provided are for informational purposes only and should not replace professional financial advice.',
  },
  {
    title: '7. Limitation of Liability',
    content: 'In no event shall SigmaFinanceAI be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or relating to your use of the application.',
  },
  {
    title: '8. Modifications to Terms',
    content: 'We reserve the right to modify these terms at any time. We will notify users of any material changes through the app. Your continued use of the app after such modifications constitutes acceptance of the updated terms.',
  },
  {
    title: '9. Governing Law',
    content: 'These terms shall be governed by and construed in accordance with applicable laws, without regard to conflict of law principles.',
  },
  {
    title: '10. Contact Information',
    content: 'If you have any questions about these Terms and Conditions, please contact us through the Contact section of the app.',
  },
];

export default function TermsScreen() {
  const colors = Colors.dark;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <GlobalHeader title="Terms & Conditions" showBack />
      
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={[styles.headerCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.headerIcon, { backgroundColor: colors.tint + '20' }]}>
              <IconSymbol name="doc.text.fill" size={32} color={colors.tint} />
            </View>
            <Text style={[styles.headerTitle, { color: colors.text }]}>
              Terms & Conditions
            </Text>
            <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
              Please read these terms carefully before using SigmaFinanceAI.
            </Text>
            <Text style={[styles.effectiveDate, { color: colors.tint }]}>
              Effective Date: November 1, 2025
            </Text>
          </View>

          {sections.map((section, index) => (
            <View 
              key={index} 
              style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <Text style={[styles.sectionTitle, { color: colors.text }]}>{section.title}</Text>
              <Text style={[styles.sectionContent, { color: colors.textSecondary }]}>
                {section.content}
              </Text>
            </View>
          ))}

          <View style={[styles.agreementCard, { backgroundColor: colors.tint + '15', borderColor: colors.tint + '30' }]}>
            <IconSymbol name="checkmark.seal.fill" size={24} color={colors.tint} />
            <Text style={[styles.agreementText, { color: colors.text }]}>
              By using SigmaFinanceAI, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions.
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
    marginBottom: 12,
  },
  effectiveDate: {
    fontSize: 13,
    fontWeight: '600',
  },
  sectionCard: {
    padding: 18,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 10,
  },
  sectionContent: {
    fontSize: 14,
    lineHeight: 22,
  },
  agreementCard: {
    flexDirection: 'row',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'flex-start',
    gap: 14,
    marginTop: 12,
  },
  agreementText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  bottomPadding: {
    height: 100,
  },
});
