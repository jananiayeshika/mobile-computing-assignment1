/**
 * The app opens at "/". Send the user straight to the Explore tab.
 */
import { Redirect } from 'expo-router';

export default function Index() {
  return <Redirect href="/explore" />;
}
