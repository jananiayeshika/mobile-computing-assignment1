/** Shown by Expo Router for any URL that does not match a route. */
import { useRouter } from 'expo-router';

import EmptyState from '../components/EmptyState';

export default function NotFoundScreen() {
  const router = useRouter();

  return (
    <EmptyState
      icon="compass-outline"
      title="Looks like you're lost"
      message="This screen doesn't exist. Let's take you back to the destinations."
      actionLabel="Go to Explore"
      onAction={() => router.replace('/explore')}
    />
  );
}
