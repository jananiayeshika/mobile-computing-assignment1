/**
 * Banner shown at the top of the app whenever AppState reports that the
 * app moved from the background to the foreground. Hides itself after 5 s.
 */
import { useEffect, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { useApp } from '../context/AppContext';
import { COLORS, RADIUS, SHADOW, SPACING } from '../constants/theme';
import { formatDuration } from '../utils/format';

const VISIBLE_MS = 5000;

export default function WelcomeBackBanner() {
  const { welcomeBack, dismissWelcomeBack } = useApp();
  const insets = useSafeAreaInsets();
  const [opacity] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (!welcomeBack) return undefined;

    opacity.setValue(0);
    Animated.timing(opacity, { toValue: 1, duration: 250, useNativeDriver: true }).start();

    const timer = setTimeout(() => {
      Animated.timing(opacity, { toValue: 0, duration: 250, useNativeDriver: true }).start(() =>
        dismissWelcomeBack()
      );
    }, VISIBLE_MS);

    return () => clearTimeout(timer);
  }, [welcomeBack, opacity, dismissWelcomeBack]);

  if (!welcomeBack) return null;

  const { awayMs, deliveredWhileAway } = welcomeBack;

  return (
    <Animated.View pointerEvents="box-none" style={[styles.wrapper, { top: insets.top + SPACING.sm, opacity }]}>
      <Pressable style={styles.banner} onPress={dismissWelcomeBack} accessibilityRole="alert">
        <Ionicons name="hand-left-outline" size={22} color={COLORS.white} />
        <View style={styles.textWrap}>
          <Text style={styles.title}>Ayubowan, welcome back! 👋</Text>
          <Text style={styles.subtitle}>
            You were away for {formatDuration(awayMs)}
            {deliveredWhileAway > 0
              ? ` · ${deliveredWhileAway} reminder${deliveredWhileAway > 1 ? 's' : ''} delivered`
              : ''}
          </Text>
        </View>
        <Ionicons name="close" size={18} color={COLORS.white} />
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: SPACING.lg,
    right: SPACING.lg,
    zIndex: 100,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    backgroundColor: COLORS.primaryDark,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    ...SHADOW,
  },
  textWrap: {
    flex: 1,
  },
  title: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 15,
  },
  subtitle: {
    color: COLORS.primaryLight,
    fontSize: 13,
    marginTop: 2,
  },
});
