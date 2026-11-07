/**
 * Wraps the React Native AppState API.
 *
 * AppState.currentState is one of:
 *   'active'     – app is in the foreground
 *   'background' – user switched to another app / home screen
 *   'inactive'   – iOS only: transition state (app switcher, incoming call)
 *
 * This hook subscribes to the 'change' event and calls `onForeground`
 * ONLY when the app comes back from 'background'/'inactive' to 'active',
 * passing how long the user was away.
 */
import { useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';

export function useAppStateListener({ onForeground, onBackground } = {}) {
  const appState = useRef(AppState.currentState);
  const backgroundedAt = useRef(null);
  const [appStateVisible, setAppStateVisible] = useState(appState.current);

  // Keep the latest callbacks in refs so the listener is registered only once.
  const onForegroundRef = useRef(onForeground);
  const onBackgroundRef = useRef(onBackground);
  useEffect(() => {
    onForegroundRef.current = onForeground;
    onBackgroundRef.current = onBackground;
  }, [onForeground, onBackground]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      const previous = appState.current;

      // active -> inactive/background : remember when the user left
      if (previous === 'active' && /inactive|background/.test(nextAppState)) {
        backgroundedAt.current = Date.now();
        onBackgroundRef.current?.({ from: previous, to: nextAppState });
      }

      // inactive/background -> active : the app came back to the foreground
      if (/inactive|background/.test(previous) && nextAppState === 'active') {
        const awayMs = backgroundedAt.current ? Date.now() - backgroundedAt.current : 0;
        backgroundedAt.current = null;
        onForegroundRef.current?.({ from: previous, to: nextAppState, awayMs });
      }

      appState.current = nextAppState;
      setAppStateVisible(nextAppState);
    });

    // Clean up the subscription when the component unmounts.
    return () => subscription.remove();
  }, []);

  return appStateVisible;
}
