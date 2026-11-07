/**
 * NESTED STACK inside the Favourites tab.
 *   /favorites        -> index.js  (saved destinations)
 *   /favorites/[id]   -> [id].js   (destination detail)
 *
 * Having its own stack means opening a favourite keeps the user in the
 * Favourites tab, and "back" returns to the Favourites list.
 */
import { Stack } from 'expo-router';

import { COLORS } from '../../../constants/theme';

export default function FavoritesStackLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.primary },
        headerTintColor: COLORS.white,
        headerTitleStyle: { fontWeight: '700' },
        headerBackButtonDisplayMode: 'minimal',
        contentStyle: { backgroundColor: COLORS.background },
      }}
    >
      <Stack.Screen name="index" options={{ title: 'My Favourites' }} />
      <Stack.Screen name="[id]" options={{ title: 'Destination' }} />
    </Stack>
  );
}
