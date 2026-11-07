/**
 * Local notification helpers built on top of expo-notifications.
 *
 * Everything notification-related lives in this one file so the screens
 * only call simple functions like `notifyNow()` or `scheduleReminder()`.
 * Only LOCAL notifications are used (no push tokens / servers), which
 * also work inside Expo Go on Android and iOS.
 */
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

export const REMINDER_CHANNEL_ID = 'visit-reminders';

// expo-notifications has no web implementation.
export const notificationsSupported = Platform.OS !== 'web';

/**
 * Reminder options shown in the "Set reminder" modal.
 * Options with `seconds` use a TIME_INTERVAL trigger,
 * the "tomorrow" option uses a DATE trigger.
 */
export const REMINDER_OPTIONS = [
  { key: '10s', label: 'In 10 seconds', description: 'Quick demo – lock the phone and wait', icon: 'flash-outline', seconds: 10 },
  { key: '1m', label: 'In 1 minute', description: 'Short timed reminder', icon: 'timer-outline', seconds: 60 },
  { key: '1h', label: 'In 1 hour', description: 'Remind me later today', icon: 'hourglass-outline', seconds: 60 * 60 },
  { key: 'tomorrow', label: 'Tomorrow at 7:00 AM', description: 'Best time to start a day trip', icon: 'calendar-outline', tomorrowAtHour: 7 },
];

/** Builds the expo-notifications trigger object and the expected fire date for an option. */
function buildTrigger(option) {
  if (option.seconds) {
    return {
      fireAt: Date.now() + option.seconds * 1000,
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: option.seconds,
        channelId: REMINDER_CHANNEL_ID,
      },
    };
  }

  const date = new Date();
  date.setDate(date.getDate() + 1);
  date.setHours(option.tomorrowAtHour, 0, 0, 0);
  return {
    fireAt: date.getTime(),
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date,
      channelId: REMINDER_CHANNEL_ID,
    },
  };
}

/**
 * Decide how a notification is presented while the app is in the FOREGROUND.
 * Without this, notifications that arrive while the app is open are hidden.
 * Called once at module level from the root layout.
 */
export function configureNotificationHandler() {
  if (!notificationsSupported) return;

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

/**
 * Android 8+ requires a channel. It must exist BEFORE asking for
 * permission on Android 13+, otherwise the permission prompt is not shown.
 */
async function ensureAndroidChannel() {
  if (Platform.OS !== 'android') return;

  await Notifications.setNotificationChannelAsync(REMINDER_CHANNEL_ID, {
    name: 'Visit reminders',
    description: 'Reminders and confirmations for your Sri Lanka trips',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#0F766E',
  });
}

/**
 * Creates the channel, checks the current permission and asks the user
 * only if we have not been granted permission yet.
 * @returns {Promise<'granted' | 'denied' | 'undetermined' | 'unsupported'>}
 */
export async function requestNotificationPermission() {
  if (!notificationsSupported) return 'unsupported';

  await ensureAndroidChannel();

  const current = await Notifications.getPermissionsAsync();
  if (isGranted(current)) return 'granted';

  const requested = await Notifications.requestPermissionsAsync();
  return isGranted(requested) ? 'granted' : requested.status;
}

function isGranted(permission) {
  return (
    permission.granted ||
    permission.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL
  );
}

/**
 * Shows a notification immediately (e.g. "Added to favourites!").
 * A trigger with only `channelId` means "now" on Android; `null` means "now" everywhere else.
 */
export async function notifyNow({ title, body, data = {} }) {
  if (!notificationsSupported) return null;

  return Notifications.scheduleNotificationAsync({
    content: { title, body, data, sound: true },
    trigger: Platform.OS === 'android' ? { channelId: REMINDER_CHANNEL_ID } : null,
  });
}

/**
 * Schedules a reminder for a destination using one of REMINDER_OPTIONS.
 * @returns {Promise<{ notificationId: string, fireAt: number }>}
 *   the identifier (needed to cancel it later) and the expected delivery time
 */
export async function scheduleReminder({ destination, option }) {
  if (!notificationsSupported) {
    throw new Error('Local notifications are not available on the web. Use Android or iOS.');
  }

  const { trigger, fireAt } = buildTrigger(option);
  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title: `Time to visit ${destination.name} 🌴`,
      body: `${destination.tagline}. Opening hours: ${destination.openingHours}.`,
      data: { destinationId: destination.id, type: 'visit-reminder' },
      sound: true,
    },
    trigger,
  });

  return { notificationId, fireAt };
}

export async function cancelReminder(notificationId) {
  if (!notificationsSupported || !notificationId) return;
  await Notifications.cancelScheduledNotificationAsync(notificationId);
}
