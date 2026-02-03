import { useState, useEffect, useCallback } from 'react';

interface NotificationSettings {
  enabled: boolean;
  dailyReminder: boolean;
  reminderTime: string; // Format "HH:MM"
  streakAlert: boolean;
}

const DEFAULT_SETTINGS: NotificationSettings = {
  enabled: false,
  dailyReminder: true,
  reminderTime: '18:00',
  streakAlert: true,
};

const STORAGE_KEY = 'makifit_notification_settings';

export function useNotifications() {
  const [settings, setSettings] = useState<NotificationSettings>(DEFAULT_SETTINGS);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [supported, setSupported] = useState(false);

  // Check if notifications are supported
  useEffect(() => {
    setSupported('Notification' in window);
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }

    // Load saved settings
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setSettings(JSON.parse(saved));
      } catch {
        // Use defaults
      }
    }
  }, []);

  // Request notification permission
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!supported) return false;

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result === 'granted';
    } catch {
      return false;
    }
  }, [supported]);

  // Update settings
  const updateSettings = useCallback((newSettings: Partial<NotificationSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Enable notifications (request permission + update settings)
  const enableNotifications = useCallback(async (): Promise<boolean> => {
    const granted = await requestPermission();
    if (granted) {
      updateSettings({ enabled: true });
      // Schedule daily reminder if enabled
      if (settings.dailyReminder) {
        scheduleDailyReminder(settings.reminderTime);
      }
    }
    return granted;
  }, [requestPermission, updateSettings, settings]);

  // Disable notifications
  const disableNotifications = useCallback(() => {
    updateSettings({ enabled: false });
    // Cancel scheduled notifications
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'CANCEL_NOTIFICATIONS',
      });
    }
  }, [updateSettings]);

  // Show a notification immediately
  const showNotification = useCallback(
    (title: string, options?: NotificationOptions) => {
      if (!supported || permission !== 'granted' || !settings.enabled) {
        return;
      }

      // Try to use service worker for better reliability
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.ready.then((registration) => {
          registration.showNotification(title, {
            icon: '/web-app-manifest-192x192.png',
            badge: '/favicon-96x96.png',
            ...options,
          });
        });
      } else {
        // Fallback to regular notification
        new Notification(title, {
          icon: '/web-app-manifest-192x192.png',
          ...options,
        });
      }
    },
    [supported, permission, settings.enabled]
  );

  // Schedule daily reminder
  const scheduleDailyReminder = useCallback((time: string) => {
    if (!supported || permission !== 'granted') return;

    const [hours, minutes] = time.split(':').map(Number);
    const now = new Date();
    const scheduled = new Date();
    scheduled.setHours(hours, minutes, 0, 0);

    // If time has passed today, schedule for tomorrow
    if (scheduled <= now) {
      scheduled.setDate(scheduled.getDate() + 1);
    }

    const delay = scheduled.getTime() - now.getTime();

    // Store the timeout ID to cancel later if needed
    const timeoutId = setTimeout(() => {
      showNotification('C\'est l\'heure de ta séance !', {
        body: 'Allez, on bouge ensemble ! 💪',
        tag: 'daily-reminder',
      });
      // Reschedule for next day
      scheduleDailyReminder(time);
    }, delay);

    // Store timeout ID for cleanup
    localStorage.setItem('makifit_reminder_timeout', timeoutId.toString());
  }, [supported, permission, showNotification]);

  // Check streak and send alert if needed
  const checkStreakAlert = useCallback(
    (currentStreak: number, lastActivityDate: string | null) => {
      if (!settings.enabled || !settings.streakAlert) return;

      if (!lastActivityDate) return;

      const lastActivity = new Date(lastActivityDate);
      const today = new Date();
      const diffDays = Math.floor(
        (today.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24)
      );

      // If last activity was yesterday and it's after 6pm, warn about streak
      const hour = today.getHours();
      if (diffDays === 1 && hour >= 18 && currentStreak > 0) {
        showNotification('Ton streak est en danger !', {
          body: `${currentStreak} jours de streak - Ne le perds pas !`,
          tag: 'streak-alert',
        });
      }
    },
    [settings.enabled, settings.streakAlert, showNotification]
  );

  return {
    settings,
    updateSettings,
    permission,
    supported,
    requestPermission,
    enableNotifications,
    disableNotifications,
    showNotification,
    checkStreakAlert,
    scheduleDailyReminder,
  };
}
