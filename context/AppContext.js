/**
 * Global (shared) state for Lanka Trails.
 *
 * Uses plain React `useState` + Context so that every screen
 * (Explore, Destination detail, Favourites, Reminders, Activity and the
 * reminder modal) reads and updates the SAME data:
 *
 *   favorites       – ids of destinations the user hearted
 *   visited         – ids of destinations the user marked as visited
 *   reminders       – scheduled visit reminders (local notifications)
 *   appStateEvents  – log of background -> foreground transitions
 *   welcomeBack     – info for the "Welcome back" banner
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

import { useAppStateListener } from '../hooks/useAppStateListener';
import {
  cancelReminder,
  notifyNow,
  requestNotificationPermission,
  scheduleReminder,
} from '../services/notifications';
import { getDestinationById } from '../data/destinations';

const AppContext = createContext(null);

const MAX_LOG_ENTRIES = 20;

export function AppProvider({ children }) {
  const [favorites, setFavorites] = useState(['sigiriya', 'galle-fort']);
  const [visited, setVisited] = useState(['temple-of-the-tooth']);
  const [reminders, setReminders] = useState([]);
  const [appStateEvents, setAppStateEvents] = useState([]);
  const [welcomeBack, setWelcomeBack] = useState(null);
  const [permission, setPermission] = useState('undetermined');

  // Mirror of `reminders` so the AppState callback can read the latest value synchronously.
  const remindersRef = useRef(reminders);
  useEffect(() => {
    remindersRef.current = reminders;
  }, [reminders]);

  /* ----------------------------- AppState ----------------------------- */

  const handleForeground = useCallback(({ from, awayMs }) => {
    const now = Date.now();

    // Reminders whose time has passed while the user was away are now "delivered".
    const isDue = (r) => r.status === 'scheduled' && r.fireAt <= now;
    const deliveredWhileAway = remindersRef.current.filter(isDue).length;
    if (deliveredWhileAway > 0) {
      setReminders((current) =>
        current.map((r) => (isDue(r) ? { ...r, status: 'delivered' } : r))
      );
    }

    const event = { id: String(now), type: 'foreground', from, at: now, awayMs };
    setAppStateEvents((current) => [event, ...current].slice(0, MAX_LOG_ENTRIES));
    setWelcomeBack({ ...event, deliveredWhileAway });
  }, []);

  const handleBackground = useCallback(({ to }) => {
    const now = Date.now();
    const event = { id: String(now), type: 'background', to, at: now };
    setAppStateEvents((current) => [event, ...current].slice(0, MAX_LOG_ENTRIES));
  }, []);

  const currentAppState = useAppStateListener({
    onForeground: handleForeground,
    onBackground: handleBackground,
  });

  const dismissWelcomeBack = useCallback(() => setWelcomeBack(null), []);

  /* ----------------------------- Favourites ---------------------------- */

  const isFavorite = useCallback((id) => favorites.includes(id), [favorites]);

  const toggleFavorite = useCallback(
    async (id) => {
      const destination = getDestinationById(id);
      const adding = !favorites.includes(id);

      setFavorites((current) =>
        current.includes(id) ? current.filter((f) => f !== id) : [id, ...current]
      );

      // Immediate local notification as feedback ("Event bookmarked!" style).
      if (adding && destination) {
        try {
          const status = await requestNotificationPermission();
          setPermission(status);
          if (status === 'granted') {
            await notifyNow({
              title: 'Added to favourites ❤️',
              body: `${destination.name} was saved to your trip wishlist.`,
              data: { destinationId: id, type: 'favourite' },
            });
          }
        } catch (error) {
          console.warn('Could not show favourite notification', error);
        }
      }
    },
    [favorites]
  );

  const removeFavorite = useCallback((id) => {
    setFavorites((current) => current.filter((f) => f !== id));
  }, []);

  /* ------------------------------ Visited ------------------------------ */

  const isVisited = useCallback((id) => visited.includes(id), [visited]);

  const toggleVisited = useCallback((id) => {
    setVisited((current) =>
      current.includes(id) ? current.filter((v) => v !== id) : [...current, id]
    );
  }, []);

  /* ----------------------------- Reminders ----------------------------- */

  /** Asks for permission, schedules the notification and stores it in state. */
  const addReminder = useCallback(async (destinationId, option) => {
    const destination = getDestinationById(destinationId);
    const status = await requestNotificationPermission();
    setPermission(status);

    if (status !== 'granted') {
      throw new Error(
        'Notification permission was not granted. Enable notifications for this app in your device settings.'
      );
    }

    const { notificationId, fireAt } = await scheduleReminder({ destination, option });

    const reminder = {
      id: notificationId,
      destinationId,
      destinationName: destination.name,
      label: option.label,
      createdAt: Date.now(),
      fireAt,
      status: 'scheduled',
    };
    setReminders((current) => [reminder, ...current]);
    return reminder;
  }, []);

  const cancelReminderById = useCallback(async (reminderId) => {
    await cancelReminder(reminderId);
    setReminders((current) =>
      current.map((r) => (r.id === reminderId ? { ...r, status: 'cancelled' } : r))
    );
  }, []);

  /** Called by the notification listener when a reminder is received in the foreground. */
  const markReminderDelivered = useCallback((reminderId) => {
    setReminders((current) =>
      current.map((r) =>
        r.id === reminderId && r.status === 'scheduled' ? { ...r, status: 'delivered' } : r
      )
    );
  }, []);

  const clearFinishedReminders = useCallback(() => {
    setReminders((current) => current.filter((r) => r.status === 'scheduled'));
  }, []);

  const refreshPermission = useCallback(async () => {
    const status = await requestNotificationPermission();
    setPermission(status);
    return status;
  }, []);

  const value = useMemo(
    () => ({
      favorites,
      visited,
      reminders,
      appStateEvents,
      currentAppState,
      welcomeBack,
      permission,
      isFavorite,
      toggleFavorite,
      removeFavorite,
      isVisited,
      toggleVisited,
      addReminder,
      cancelReminderById,
      markReminderDelivered,
      clearFinishedReminders,
      dismissWelcomeBack,
      refreshPermission,
    }),
    [
      favorites,
      visited,
      reminders,
      appStateEvents,
      currentAppState,
      welcomeBack,
      permission,
      isFavorite,
      toggleFavorite,
      removeFavorite,
      isVisited,
      toggleVisited,
      addReminder,
      cancelReminderById,
      markReminderDelivered,
      clearFinishedReminders,
      dismissWelcomeBack,
      refreshPermission,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

/** Hook used by every screen to read / update the shared state. */
export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used inside <AppProvider>');
  }
  return context;
}
