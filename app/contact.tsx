import React from 'react';
import { ScrollView, StyleSheet, View, Text, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import GlobalHeader from '@/components/GlobalHeader';

const contactOptions = [
  {
    title: 'Email Support',
    description: 'Get help with technical issues or questions',
    icon: 'envelope.fill',
    action: 'mailto:support@sigmafinanceai.com',
    actionLabel: 'Send Email',
    color: '#3B82F6',
  },
  {
    title: 'Feature Request',
    description: 'Suggest new features or improvements',
    icon: 'lightbulb.fill',
    action: 'mailto:feedback@sigmafinanceai.com?subject=Feature%20Request',
    actionLabel: 'Submit Request',
    color: '#F59E0B',
  },
  {
    title: 'Report a Bug',
    description: 'Help us improve by reporting issues',
    icon: 'ant.fill',
    action: 'mailto:bugs@sigmafinanceai.com?subject=Bug%20Report',
    actionLabel: 'Report Bug',
    color: '#EF4444',
  },
];

const faqItems = [
  {
    question: 'How do I reset my onboarding preferences?',
    answer: 'Open the menu and select "Restart Onboarding" to reset your preferences and start fresh.',
  },
  {
    question: 'Can I sync my plan across devices?',
    answer: 'Currently, plans are stored locally on your device. Cloud sync is coming in a future update.',
  },
  {
    question: 'How often is the AI tools list updated?',
    answer: 'We regularly update our AI tools database to include the latest and most relevant solutions.',
  },
];

export default function ContactScreen() {
  const colors = Colors.dark;

  const handleAction = (action: string) => {
    Linking.openURL(action);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <GlobalHeader title="Contact / Feedback" showBack />
      
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={[styles.pageTitle, { color: colors.text }]}>
            We'd Love to Hear From You
          </Text>
          <Text style={[styles.pageSubtitle, { color: colors.textSecondary }]}>
            Have questions, feedback, or suggestions? Reach out to us through any of the channels below.
          </Text>

          <View style={styles.contactOptions}>
            {contactOptions.map((option, index) => (
              <View 
                key={index} 
                style={[styles.contactCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              >
                <View style={[styles.contactIcon, { backgroundColor: option.color + '20' }]}>
                  <IconSymbol name={option.icon as any} size={28} color={option.color} />
                </View>
                <Text style={[styles.contactTitle, { color: colors.text }]}>{option.title}</Text>
                <Text style={[styles.contactDescription, { color: colors.textSecondary }]}>
                  {option.description}
                </Text>
                <TouchableOpacity
                  style={[styles.contactButton, { backgroundColor: option.color }]}
                  onPress={() => handleAction(option.action)}
                >
                  <Text style={styles.contactButtonText}>{option.actionLabel}</Text>
                  <IconSymbol name="arrow.up.right" size={16} color="#fff" />
                </TouchableOpacity>
              </View>
            ))}
          </View>

          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Frequently Asked Questions
          </Text>

          {faqItems.map((item, index) => (
            <View 
              key={index} 
              style={[styles.faqCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <View style={styles.faqQuestion}>
                <IconSymbol name="questionmark.circle.fill" size={20} color={colors.tint} />
                <Text style={[styles.faqQuestionText, { color: colors.text }]}>{item.question}</Text>
              </View>
              <Text style={[styles.faqAnswer, { color: colors.textSecondary }]}>{item.answer}</Text>
            </View>
          ))}

          <View style={[styles.socialCard, { backgroundColor: colors.tint + '15', borderColor: colors.tint + '30' }]}>
            <Text style={[styles.socialTitle, { color: colors.tint }]}>Connect With Us</Text>
            <Text style={[styles.socialText, { color: colors.text }]}>
              Follow us on social media for updates, tips, and finance transformation insights.
            </Text>
            <View style={styles.socialIcons}>
              <TouchableOpacity style={[styles.socialButton, { backgroundColor: colors.card }]}>
                <IconSymbol name="link" size={22} color={colors.tint} />
              </TouchableOpacity>
              <TouchableOpacity style={[styles.socialButton, { backgroundColor: colors.card }]}>
                <IconSymbol name="person.2.fill" size={22} color={colors.tint} />
              </TouchableOpacity>
              <TouchableOpacity style={[styles.socialButton, { backgroundColor: colors.card }]}>
                <IconSymbol name="bubble.left.fill" size={22} color={colors.tint} />
              </TouchableOpacity>
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
    marginBottom: 28,
  },
  contactOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 32,
  },
  contactCard: {
    width: '100%',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
  },
  contactIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  contactTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 6,
  },
  contactDescription: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    gap: 6,
  },
  contactButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  faqCard: {
    padding: 18,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 12,
  },
  faqQuestion: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 10,
  },
  faqQuestionText: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
    lineHeight: 22,
  },
  faqAnswer: {
    fontSize: 14,
    lineHeight: 20,
    paddingLeft: 30,
  },
  socialCard: {
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    marginTop: 20,
  },
  socialTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 8,
  },
  socialText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  socialIcons: {
    flexDirection: 'row',
    gap: 16,
  },
  socialButton: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomPadding: {
    height: 100,
  },
});
