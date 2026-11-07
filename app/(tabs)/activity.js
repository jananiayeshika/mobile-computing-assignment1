/**
 * /activity – ACTIVITY screen
 *
 * Makes the native APIs visible:
 *   - the current AppState value and a live log of background/foreground events
 *   - notification permission status and a "send test notification" button
 *   - a summary of the shared global state
 */
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useApp } from '../../context/AppContext';
import { notificationsSupported, notifyNow } from '../../services/notifications';
import { COLORS, RADIUS, SHADOW, SPACING } from '../../constants/theme';
import { formatDuration, formatTime } from '../../utils/format';

const APP_STATE_COLORS = {
  active: COLORS.success,
  background: COLORS.danger,
  inactive: COLORS.accent,
};

function StatTile({ icon, value, label }) {
  return (
    <View style={styles.tile}>
      <Ionicons name={icon} size={20} color={COLORS.primary} />
      <Text style={styles.tileValue}>{value}</Text>
      <Text style={styles.tileLabel}>{label}</Text>
    </View>
  );
}

export default function ActivityScreen() {
  const { appStateEvents, currentAppState, favorites, visited, reminders, permission, refreshPermission } = useApp();

  const foregroundCount = appStateEvents.filter((e) => e.type === 'foreground').length;

  const sendTestNotification = async () => {
    if (!notificationsSupported) {
      Alert.alert('Not supported', 'Local notifications only work on Android and iOS devices.');
      return;
    }
    const status = await refreshPermission();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow notifications for Lanka Trails in your device settings.');
      return;
    }
    await notifyNow({
      title: 'Lanka Trails 🌴',
      body: 'Notifications are working! You will be reminded about your trips here.',
      data: { type: 'test' },
    });
  };

  const header = (
    <View>
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>App state (AppState API)</Text>
        <View style={styles.stateRow}>
          <View style={[styles.dot, { backgroundColor: APP_STATE_COLORS[currentAppState] ?? COLORS.textMuted }]} />
          <Text style={styles.stateText}>Current state: {currentAppState}</Text>
        </View>
        <Text style={styles.hint}>
          Press the Home button (or switch apps) and come back. A &quot;Welcome back&quot; banner appears and the
          event is logged below. Reminders that fired while you were away are marked as delivered.
        </Text>
      </View>

      <View style={styles.tiles}>
        <StatTile icon="heart-outline" value={favorites.length} label="Favourites" />
        <StatTile icon="checkmark-circle-outline" value={visited.length} label="Visited" />
        <StatTile icon="notifications-outline" value={reminders.length} label="Reminders" />
        <StatTile icon="refresh-outline" value={foregroundCount} label="Returns" />
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Local notifications</Text>
        <Text style={styles.stateText}>
          Permission: <Text style={styles.bold}>{notificationsSupported ? permission : 'not supported on web'}</Text>
        </Text>
        <Pressable
          style={({ pressed }) => [styles.button, pressed && { opacity: 0.8 }]}
          onPress={sendTestNotification}
        >
          <Ionicons name="paper-plane-outline" size={18} color={COLORS.white} />
          <Text style={styles.buttonText}>Send a test notification now</Text>
        </Pressable>
      </View>

      <Text style={styles.logTitle}>AppState event log</Text>
    </View>
  );

  return (
    <FlatList
      style={styles.screen}
      contentContainerStyle={styles.list}
      data={appStateEvents}
      keyExtractor={(item) => item.id + item.type}
      ListHeaderComponent={header}
      renderItem={({ item }) => {
        const isForeground = item.type === 'foreground';
        return (
          <View style={styles.logRow}>
            <Ionicons
              name={isForeground ? 'arrow-up-circle' : 'arrow-down-circle'}
              size={22}
              color={isForeground ? COLORS.success : COLORS.danger}
            />
            <View style={styles.logBody}>
              <Text style={styles.logText}>
                {isForeground
                  ? `${item.from} → active (back after ${formatDuration(item.awayMs)})`
                  : `active → ${item.to}`}
              </Text>
              <Text style={styles.logTime}>{formatTime(item.at)}</Text>
            </View>
          </View>
        );
      }}
      ListEmptyComponent={
        <Text style={styles.emptyLog}>No events yet – send the app to the background and reopen it.</Text>
      }
    />
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  list: {
    padding: SPACING.lg,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    ...SHADOW,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  stateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  stateText: {
    fontSize: 15,
    color: COLORS.text,
  },
  bold: {
    fontWeight: '700',
  },
  hint: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: SPACING.sm,
    lineHeight: 19,
  },
  tiles: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  tile: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    ...SHADOW,
  },
  tileValue: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text,
    marginTop: 4,
  },
  tileLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: RADIUS.md,
    marginTop: SPACING.md,
  },
  buttonText: {
    color: COLORS.white,
    fontWeight: '700',
  },
  logTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    marginBottom: SPACING.sm,
  },
  logRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    backgroundColor: COLORS.card,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.sm,
  },
  logBody: {
    flex: 1,
  },
  logText: {
    fontSize: 14,
    color: COLORS.text,
  },
  logTime: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  emptyLog: {
    color: COLORS.textMuted,
    textAlign: 'center',
    paddingVertical: SPACING.xl,
  },
});
