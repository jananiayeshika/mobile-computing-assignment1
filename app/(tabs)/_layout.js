/**
 * TAB LAYOUT (bottom tab navigator)
 *
 *   explore    -> nested Stack (list -> detail)
 *   favorites  -> nested Stack (list -> detail)
 *   reminders  -> single screen
 *   activity   -> single screen (AppState log + notification status)
 *
 * The Explore and Favourites tabs hide the tab header because their own
 * nested Stack layouts render a header with a working back button.
 */
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useApp } from '../../context/AppContext';
import { COLORS } from '../../constants/theme';

export default function TabLayout() {
  const { favorites, reminders } = useApp();
  const activeReminders = reminders.filter((r) => r.status === 'scheduled').length;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        headerStyle: { backgroundColor: COLORS.primary },
        headerTintColor: COLORS.white,
        headerTitleStyle: { fontWeight: '700' },
      }}
    >
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          headerShown: false,
          tabBarIcon: ({ color, size }) => <Ionicons name="compass-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: 'Favourites',
          headerShown: false,
          // Badge shows the size of the SHARED favourites state.
          tabBarBadge: favorites.length > 0 ? favorites.length : undefined,
          tabBarBadgeStyle: { backgroundColor: COLORS.danger },
          tabBarIcon: ({ color, size }) => <Ionicons name="heart-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="reminders"
        options={{
          title: 'Reminders',
          tabBarBadge: activeReminders > 0 ? activeReminders : undefined,
          tabBarBadgeStyle: { backgroundColor: COLORS.accent },
          tabBarIcon: ({ color, size }) => <Ionicons name="notifications-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="activity"
        options={{
          title: 'Activity',
          tabBarIcon: ({ color, size }) => <Ionicons name="pulse-outline" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
