/**
 * SilenceNow Notification Service - User Retention & Engagement
 * 
 * BUSINESS GOAL: Keep users engaged, drive report purchases, build habit
 * RETENTION STRATEGY: Smart notifications based on noise patterns & legal progress
 * CONVERSION TRIGGER: "You now have enough evidence for legal action!"
 */

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BRAND from '../theme/BrandColors';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

class NotificationService {
  constructor() {
    this.isInitialized = false;
    this.notificationTypes = {
      // Real-time noise alerts
      NOISE_DETECTED: 'noise_detected',
      SIGNIFICANT_VIOLATION: 'significant_violation',
      PATTERN_RECOGNIZED: 'pattern_recognized',
      
      // Legal progress updates
      EVIDENCE_MILESTONE: 'evidence_milestone',
      LEGAL_STRENGTH_INCREASE: 'legal_strength_increase',
      READY_FOR_ACTION: 'ready_for_action',
      
      // Engagement & retention
      DAILY_SUMMARY: 'daily_summary',
      WEEKLY_PROGRESS: 'weekly_progress',
      ONBOARDING_REMINDER: 'onboarding_reminder',
      
      // Revenue conversion
      REPORT_READY: 'report_ready',
      LIMITED_OFFER: 'limited_offer',
      SUCCESS_STORY: 'success_story'
    };
  }

  /**
   * Initialize notification system
   */
  async initialize() {
    if (this.isInitialized) return true;

    try {
      // Request permissions
      const { status } = await Notifications.requestPermissionsAsync();
      
      if (status !== 'granted') {
        console.warn('Notification permission denied');
        return false;
      }

      // Get push token for remote notifications
      const token = await Notifications.getExpoPushTokenAsync();
      console.log('Push token:', token);

      // Store token for backend
      await AsyncStorage.setItem('pushToken', token.data);

      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('Notification initialization failed:', error);
      return false;
    }
  }

  /**
   * BUSINESS CRITICAL: Noise violation detected notification
   */
  async sendNoiseAlert(noiseData) {
    const { decibel, classification, legalScore } = noiseData;
    
    let title, body, priority;
    
    if (legalScore > 80) {
      title = "🚨 Schwere Lärmverletzung!";
      body = `${Math.round(decibel)}dB ${classification} - Starke Beweislage (${legalScore}/100)`;
      priority = 'high';
    } else if (legalScore > 60) {
      title = "⚠️ Lärmverstoß dokumentiert";
      body = `${Math.round(decibel)}dB ${classification} - Gute Beweislage aufgebaut`;
      priority = 'default';
    } else {
      title = "📊 Lärm erfasst";
      body = `${Math.round(decibel)}dB ${classification} - Wird dokumentiert`;
      priority = 'low';
    }

    await this.scheduleNotification({
      title,
      body,
      data: {
        type: this.notificationTypes.NOISE_DETECTED,
        noiseData,
        actionUrl: 'silencenow://evidence-detail'
      },
      priority,
      sound: legalScore > 70 ? 'default' : null
    });
  }

  /**
   * CONVERSION CRITICAL: Legal milestone reached
   */
  async sendLegalMilestone(milestone) {
    const milestoneMessages = {
      'first_evidence': {
        title: "🎯 Erste Beweise gesammelt!",
        body: "Deine Lärmprotokollierung hat begonnen. Weiter so!",
        action: "App öffnen"
      },
      'strong_case': {
        title: "⚖️ Starke Beweislage erreicht!",
        body: "Du hast jetzt genug Beweise für eine formelle Beschwerde.",
        action: "Bericht erstellen"
      },
      'legal_action_ready': {
        title: "🏆 Bereit für Mietminderung!",
        body: "Deine Beweislage ist stark genug für rechtliche Schritte. Jetzt handeln!",
        action: "Premium-Bericht kaufen"
      },
      'pattern_detected': {
        title: "📈 Störungsmuster erkannt",
        body: "Systematische Lärmbelästigung dokumentiert - das stärkt deinen Fall erheblich!",
        action: "Details ansehen"
      }
    };

    const message = milestoneMessages[milestone.type];
    if (!message) return;

    await this.scheduleNotification({
      title: message.title,
      body: message.body,
      data: {
        type: this.notificationTypes.EVIDENCE_MILESTONE,
        milestone,
        actionUrl: milestone.type === 'legal_action_ready' 
          ? 'silencenow://reports' 
          : 'silencenow://dashboard'
      },
      priority: 'high',
      sound: 'default'
    });
  }

  /**
   * REVENUE DRIVER: Daily progress summary
   */
  async sendDailySummary(summaryData) {
    const { eventsToday, totalEvents, legalScore, potentialSavings } = summaryData;
    
    if (eventsToday === 0) return; // Don't spam if no activity

    const title = eventsToday > 3 ? "📊 Aktiver Lärm-Tag!" : "📋 Tägliche Zusammenfassung";
    const body = `${eventsToday} neue Störungen • ${totalEvents} gesamt • ${potentialSavings}€/Monat möglich`;

    await this.scheduleNotification({
      title,
      body,
      data: {
        type: this.notificationTypes.DAILY_SUMMARY,
        summaryData,
        actionUrl: 'silencenow://dashboard'
      },
      priority: 'default'
    });
  }

  /**
   * CONVERSION OPTIMIZATION: Weekly progress & upsell
   */
  async sendWeeklyProgress(progressData) {
    const { 
      eventsThisWeek, 
      legalScoreImprovement, 
      readyForReport,
      estimatedSavings 
    } = progressData;

    let title, body, actionUrl;

    if (readyForReport) {
      title = "🚀 Zeit für deinen ersten Bericht!";
      body = `${eventsThisWeek} Störungen diese Woche. Geschätzte Ersparnis: ${estimatedSavings}€/Monat`;
      actionUrl = 'silencenow://reports';
    } else {
      title = "📈 Wochenfortschritt";
      body = `${eventsThisWeek} Störungen dokumentiert. Legal-Score: +${legalScoreImprovement} Punkte`;
      actionUrl = 'silencenow://dashboard';
    }

    await this.scheduleNotification({
      title,
      body,
      data: {
        type: this.notificationTypes.WEEKLY_PROGRESS,
        progressData,
        actionUrl
      },
      priority: 'default',
      trigger: { weekday: 1, hour: 10, minute: 0 } // Monday 10 AM
    });
  }

  /**
   * ENGAGEMENT: Smart onboarding reminders
   */
  async sendOnboardingReminder(stage) {
    const reminders = {
      'demo_incomplete': {
        title: "🎤 Demo noch nicht ausprobiert?",
        body: "Sieh in 60 Sekunden, wie SilenceNow funktioniert!",
        delay: 24 * 60 * 60 // 24 hours
      },
      'first_monitoring': {
        title: "🔍 Beginne deine Beweissammlung",
        body: "Starte die 24/7 Lärmüberwachung und sammle automatisch Beweise.",
        delay: 3 * 60 * 60 // 3 hours
      },
      're_engagement': {
        title: "😴 App pausiert - Beweise gehen verloren!",
        body: "Aktiviere das Monitoring wieder um weiter Beweise zu sammeln.",
        delay: 7 * 24 * 60 * 60 // 7 days
      }
    };

    const reminder = reminders[stage];
    if (!reminder) return;

    await this.scheduleNotification({
      title: reminder.title,
      body: reminder.body,
      data: {
        type: this.notificationTypes.ONBOARDING_REMINDER,
        stage,
        actionUrl: 'silencenow://onboarding'
      },
      trigger: { seconds: reminder.delay }
    });
  }

  /**
   * REVENUE CONVERSION: Report purchase triggers
   */
  async sendReportPrompt(promptType, userData) {
    const prompts = {
      'evidence_ready': {
        title: "⚖️ Beweislage stark genug!",
        body: `${userData.legalScore}/100 Punkte erreicht. Erstelle jetzt deinen Bericht für ${userData.estimatedSavings}€/Monat Ersparnis.`,
        urgency: 'high'
      },
      'nighttime_violations': {
        title: "🌙 Nächtliche Ruhestörung!",
        body: "Nachts ist rechtlich schwerwiegender. Dokumentiere jetzt für stärkeren Fall!",
        urgency: 'high'
      },
      'limited_offer': {
        title: "💰 24h Sonderangebot!",
        body: "Premium-Bericht heute 30% günstiger. Nur für Nutzer mit starker Beweislage.",
        urgency: 'urgent'
      },
      'success_motivation': {
        title: "🏆 Andere sparen bereits Geld!",
        body: "Nutzer mit ähnlicher Beweislage erreichten durchschnittlich 23% Mietminderung.",
        urgency: 'medium'
      }
    };

    const prompt = prompts[promptType];
    if (!prompt) return;

    await this.scheduleNotification({
      title: prompt.title,
      body: prompt.body,
      data: {
        type: this.notificationTypes.REPORT_READY,
        promptType,
        userData,
        actionUrl: 'silencenow://reports'
      },
      priority: prompt.urgency === 'urgent' ? 'max' : 'high',
      sound: 'default'
    });
  }

  /**
   * Schedule notification (local or push)
   */
  async scheduleNotification({ title, body, data, priority = 'default', sound, trigger }) {
    try {
      const notificationContent = {
        title,
        body,
        data,
        sound: sound || null,
        priority,
        color: BRAND.COLORS.JUSTICE_GREEN
      };

      let notificationId;
      
      if (trigger) {
        // Scheduled notification
        notificationId = await Notifications.scheduleNotificationAsync({
          content: notificationContent,
          trigger
        });
      } else {
        // Immediate notification
        notificationId = await Notifications.scheduleNotificationAsync({
          content: notificationContent,
          trigger: null
        });
      }

      // Log for analytics
      await this.logNotification(notificationId, data.type, { title, body });
      
      return notificationId;
    } catch (error) {
      console.error('Failed to schedule notification:', error);
    }
  }

  /**
   * Handle notification tap
   */
  async handleNotificationTap(notification) {
    const { data } = notification.request.content;
    
    if (data.actionUrl) {
      // Navigate to specific screen
      // This would integrate with your navigation system
      console.log('Navigate to:', data.actionUrl);
    }

    // Log interaction for conversion optimization
    await this.logNotificationTap(data.type);
  }

  /**
   * Cancel scheduled notifications
   */
  async cancelNotifications(type) {
    try {
      const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
      
      for (const notification of scheduledNotifications) {
        if (notification.content.data?.type === type) {
          await Notifications.cancelScheduledNotificationAsync(notification.identifier);
        }
      }
    } catch (error) {
      console.error('Failed to cancel notifications:', error);
    }
  }

  /**
   * Update notification settings based on user preferences
   */
  async updateSettings(settings) {
    await AsyncStorage.setItem('notificationSettings', JSON.stringify({
      noiseAlerts: settings.noiseAlerts ?? true,
      legalMilestones: settings.legalMilestones ?? true,
      dailySummary: settings.dailySummary ?? true,
      weeklyProgress: settings.weeklyProgress ?? true,
      marketingOffers: settings.marketingOffers ?? false,
      nightMode: settings.nightMode ?? true, // Quiet hours: 22:00-06:00
      ...settings
    }));
  }

  /**
   * Check if notifications are enabled for type
   */
  async isNotificationEnabled(type) {
    try {
      const settings = await AsyncStorage.getItem('notificationSettings');
      const parsed = settings ? JSON.parse(settings) : {};
      
      // Default to enabled for critical notifications
      const criticalTypes = [
        this.notificationTypes.SIGNIFICANT_VIOLATION,
        this.notificationTypes.READY_FOR_ACTION
      ];
      
      if (criticalTypes.includes(type)) {
        return parsed[type] !== false; // Default true
      }
      
      return parsed[type] === true; // Default false for non-critical
    } catch (error) {
      console.error('Failed to check notification settings:', error);
      return false;
    }
  }

  /**
   * Log notification for analytics
   */
  async logNotification(notificationId, type, content) {
    try {
      await AsyncStorage.setItem(`notification_${notificationId}`, JSON.stringify({
        type,
        content,
        sentAt: Date.now(),
        opened: false
      }));
    } catch (error) {
      console.error('Failed to log notification:', error);
    }
  }

  /**
   * Log notification tap for conversion tracking
   */
  async logNotificationTap(type) {
    try {
      const tapLog = await AsyncStorage.getItem('notificationTaps') || '[]';
      const taps = JSON.parse(tapLog);
      
      taps.push({
        type,
        tappedAt: Date.now()
      });
      
      // Keep only last 100 taps
      if (taps.length > 100) {
        taps.splice(0, taps.length - 100);
      }
      
      await AsyncStorage.setItem('notificationTaps', JSON.stringify(taps));
    } catch (error) {
      console.error('Failed to log notification tap:', error);
    }
  }

  /**
   * Get notification analytics
   */
  async getAnalytics() {
    try {
      const tapLog = await AsyncStorage.getItem('notificationTaps') || '[]';
      const taps = JSON.parse(tapLog);
      
      const analytics = {
        totalTaps: taps.length,
        tapsByType: {},
        recentActivity: taps.slice(-10)
      };
      
      taps.forEach(tap => {
        analytics.tapsByType[tap.type] = (analytics.tapsByType[tap.type] || 0) + 1;
      });
      
      return analytics;
    } catch (error) {
      console.error('Failed to get notification analytics:', error);
      return { totalTaps: 0, tapsByType: {}, recentActivity: [] };
    }
  }
}

export default new NotificationService();