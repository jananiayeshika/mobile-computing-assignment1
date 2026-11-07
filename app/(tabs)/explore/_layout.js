/**
 * NESTED STACK inside the Explore tab.
 *   /explore        -> index.js  (destination list)
 *   /explore/[id]   -> [id].js   (destination detail, pushed on top with a back button)
 */
import { Stack } from 'expo-router';

import { COLORS } from '../../../constants/theme';

export default function ExploreStackLayout() {
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
      <Stack.Screen name="index" options={{ title: 'Lanka Trails' }} />
      <Stack.Screen name="[id]" options={{ title: 'Destination' }} />
    </Stack>
  );
}
