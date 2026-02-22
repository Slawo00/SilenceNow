/**
 * BackgroundKeepAlive Service
 * Hält die App für 24/7 Nacht-Monitoring am Leben
 */

import { AppState } from 'react-native';
import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import * as Notifications from 'expo-notifications';
import { Audio } from 'expo-av';

const BACKGROUND_TASK_NAME = 'noise-monitoring-background';

class BackgroundKeepAlive {
  constructor() {
    this.appStateSubscription = null;
    this.keepAliveSound = null;
    this.isNightMode = false;
    this.wakeTimer = null;
  }

  /**
   * Aktiviert 24/7 Night Mode
   */
  async enableNightMode() {
    console.log('[KeepAlive] 🌙 Activating Night Mode for 24/7 monitoring');
    this.isNightMode = true;

    try {
      // 1. Persistent Notification (verhindert App-Kill)
      await this._setupPersistentNotification();

      // 2. Background Fetch registrieren
      await this._registerBackgroundTask();

      // 3. Verstärkter Keep-Alive Sound
      await this._startEnhancedKeepAlive();

      // 4. Wake-Timer für iOS
      this._startWakeTimer();

      // 5. App State Monitoring
      this._monitorAppState();

      console.log('[KeepAlive] ✅ Night Mode activated');
    } catch (error) {
      console.error('[KeepAlive] Failed to activate night mode:', error);
      throw error;
    }
  }

  async disableNightMode() {
    console.log('[KeepAlive] ☀️ Disabling Night Mode');
    this.isNightMode = false;

    // Stop all keep-alive mechanisms
    await this._stopEnhancedKeepAlive();
    this._stopWakeTimer();
    
    if (this.appStateSubscription) {
      this.appStateSubscription.remove();
    }

    // Remove persistent notification
    await Notifications.dismissAllNotificationsAsync();
  }

  async _setupPersistentNotification() {
    // Request permissions
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      console.warn('[KeepAlive] Notification permission denied');
      return;
    }

    // Configure notification behavior
    await Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: false,
        shouldPlaySound: false,
        shouldSetBadge: false,
      }),
    });

    // Show persistent monitoring notification
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🔇 SilenceNow',
        body: 'Überwacht Lärm im Hintergrund • Nachtmodus aktiv',
        data: { persistent: true },
        sticky: true,
        priority: 'high',
      },
      trigger: null, // Show immediately
    });
  }

  async _registerBackgroundTask() {
    try {
      // Define background task
      TaskManager.defineTask(BACKGROUND_TASK_NAME, async ({ data, error }) => {
        if (error) {
          console.error('[BackgroundTask] Error:', error);
          return BackgroundFetch.BackgroundFetchResult.Failed;
        }

        console.log('[BackgroundTask] 🔄 Keep-alive ping');
        
        // Ping to keep monitoring alive
        if (this.onBackgroundPing) {
          await this.onBackgroundPing();
        }

        return BackgroundFetch.BackgroundFetchResult.NewData;
      });

      // Register for background execution
      const status = await BackgroundFetch.getStatusAsync();
      if (status !== BackgroundFetch.BackgroundFetchStatus.Available) {
        console.warn('[KeepAlive] Background fetch not available');
        return;
      }

      await BackgroundFetch.registerTaskAsync(BACKGROUND_TASK_NAME, {
        minimumInterval: 30, // 30 seconds - aggressive for night monitoring
        stopOnTerminate: false,
        startOnBoot: false,
      });

      console.log('[KeepAlive] Background task registered');
    } catch (error) {
      console.error('[KeepAlive] Background task registration failed:', error);
    }
  }

  async _startEnhancedKeepAlive() {
    try {
      // Create longer silent audio (2 minutes) to prevent suspension
      const silentWav = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=';
      
      const { sound } = await Audio.Sound.createAsync(
        { uri: silentWav },
        { 
          isLooping: true, 
          volume: 0.001, // Barely audible
          shouldPlay: true,
          progressUpdateIntervalMillis: 30000, // 30 second updates
        }
      );
      
      this.keepAliveSound = sound;
      
      // Restart sound every 25 minutes to prevent iOS suspension
      this.keepAliveInterval = setInterval(async () => {
        if (this.keepAliveSound && this.isNightMode) {
          try {
            await this.keepAliveSound.stopAsync();
            await this.keepAliveSound.playAsync();
            console.log('[KeepAlive] 🔄 Sound loop restarted');
          } catch (error) {
            console.warn('[KeepAlive] Sound restart failed:', error);
          }
        }
      }, 25 * 60 * 1000); // Every 25 minutes

      console.log('[KeepAlive] Enhanced keep-alive sound started');
    } catch (error) {
      console.error('[KeepAlive] Keep-alive sound failed:', error);
    }
  }

  async _stopEnhancedKeepAlive() {
    if (this.keepAliveInterval) {
      clearInterval(this.keepAliveInterval);
    }

    if (this.keepAliveSound) {
      try {
        await this.keepAliveSound.stopAsync();
        await this.keepAliveSound.unloadAsync();
      } catch (_) {}
      this.keepAliveSound = null;
    }
  }

  _startWakeTimer() {
    // Wake the app every 20 minutes to prevent deep sleep
    this.wakeTimer = setInterval(() => {
      if (this.isNightMode) {
        console.log('[KeepAlive] ⏰ Wake timer ping');
        // Trigger a small operation to wake the JS thread
        Date.now();
      }
    }, 20 * 60 * 1000); // Every 20 minutes
  }

  _stopWakeTimer() {
    if (this.wakeTimer) {
      clearInterval(this.wakeTimer);
      this.wakeTimer = null;
    }
  }

  _monitorAppState() {
    this.appStateSubscription = AppState.addEventListener('change', (nextAppState) => {
      if (this.isNightMode) {
        console.log('[KeepAlive] App state changed to:', nextAppState);
        
        if (nextAppState === 'background') {
          console.log('[KeepAlive] 🌙 App backgrounded - night mode keeping alive');
        } else if (nextAppState === 'active') {
          console.log('[KeepAlive] ☀️ App foregrounded - night mode still active');
        }
      }
    });
  }

  /**
   * Callback für Background Task
   */
  setBackgroundPingCallback(callback) {
    this.onBackgroundPing = callback;
  }
}

export default new BackgroundKeepAlive();