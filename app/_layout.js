/**
 * ROOT LAYOUT (Stack navigator)
 *
 *   /(tabs)          -> the bottom tab navigator (no header of its own)
 *   /reminder/[id]   -> "Set reminder" screen presented as a MODAL
 *   +not-found       -> fallback for unknown routes
 *
 * It also:
 *   - wraps the whole app in <AppProvider> (global shared state)
 *   - configures how notifications are shown in the foreground
 *   - listens for notification taps and deep-links to the destination
 *   - shows the AppState "Welcome back" banner above every screen
 */
import { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as Notifications from 'expo-notifications';

import { AppProvider, useApp } from '../context/AppContext';
import WelcomeBackBanner from '../components/WelcomeBackBanner';
import { configureNotificationHandler, notificationsSupported } from '../services/notifications';
import { COLORS } from '../constants/theme';

// Must run before any notification arrives, so call it at module level.
configureNotificationHandler();

function NotificationObserver() {
  const router = useRouter();
  const { markReminderDelivered } = useApp();

  useEffect(() => {
    if (!notificationsSupported) return undefined;

    // 1) A notification arrived while the app was OPEN.
    const receivedSub = Notifications.addNotificationReceivedListener((notification) => {
      markReminderDelivered(notification.request.identifier);
    });

    // 2) The user TAPPED a notification -> open that destination.
    const openDestination = (response) => {
      const { destinationId } = response?.notification.request.content.data ?? {};
      markReminderDelivered(response?.notification.request.identifier);
      if (destinationId) {
        router.push({ pathname: '/explore/[id]', params: { id: destinationId } });
      }
    };
    const responseSub = Notifications.addNotificationResponseReceivedListener(openDestination);

    // 3) The app was launched by tapping a notification while it was closed.
    const lastResponse = Notifications.getLastNotificationResponse();
    if (lastResponse) {
      openDestination(lastResponse);
      Notifications.clearLastNotificationResponse();
    }

    return () => {
      receivedSub.remove();
      responseSub.remove();
    };
  }, [router, markReminderDelivered]);

  return null;
}

export default function RootLayout() {
  return (
    <AppProvider>
      <View style={styles.root}>
        <StatusBar style="light" />

        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: COLORS.primary },
            headerTintColor: COLORS.white,
            headerTitleStyle: { fontWeight: '700' },
            contentStyle: { backgroundColor: COLORS.background },
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="reminder/[id]"
            options={{
              presentation: 'modal',
              title: 'Set a visit reminder',
            }}
          />
          <Stack.Screen name="+not-found" options={{ title: 'Not found' }} />
        </Stack>

        <NotificationObserver />
        <WelcomeBackBanner />
      </View>
    </AppProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
