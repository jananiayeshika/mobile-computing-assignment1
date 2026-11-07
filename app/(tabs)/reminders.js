/**
 * /reminders – REMINDERS screen
 *
 * Lists every visit reminder scheduled with expo-notifications and its
 * status (scheduled / delivered / cancelled). Cancelling asks for
 * confirmation and also cancels the real OS notification.
 */
import { useState } from 'react';
import { FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import ConfirmModal from '../../components/ConfirmModal';
import EmptyState from '../../components/EmptyState';
import { getDestinationById } from '../../data/destinations';
import { useApp } from '../../context/AppContext';
import { COLORS, RADIUS, SHADOW, SPACING } from '../../constants/theme';
import { formatDateTime } from '../../utils/format';

const STATUS_STYLE = {
  scheduled: { label: 'Scheduled', color: COLORS.accent, icon: 'time-outline' },
  delivered: { label: 'Delivered', color: COLORS.success, icon: 'checkmark-done-outline' },
  cancelled: { label: 'Cancelled', color: COLORS.textMuted, icon: 'close-circle-outline' },
};

export default function RemindersScreen() {
  const router = useRouter();
  const { reminders, cancelReminderById, clearFinishedReminders } = useApp();
  const [pendingCancel, setPendingCancel] = useState(null);

  const hasFinished = reminders.some((r) => r.status !== 'scheduled');

  return (
    <View style={styles.screen}>
      <FlatList
        data={reminders}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          reminders.length > 0 ? (
            <View style={styles.headerRow}>
              <Text style={styles.headerText}>
                {reminders.filter((r) => r.status === 'scheduled').length} upcoming · {reminders.length} total
              </Text>
              {hasFinished && (
                <Pressable onPress={clearFinishedReminders} hitSlop={8}>
                  <Text style={styles.clearText}>Clear finished</Text>
                </Pressable>
              )}
            </View>
          ) : null
        }
        renderItem={({ item }) => {
          const destination = getDestinationById(item.destinationId);
          const status = STATUS_STYLE[item.status];
          return (
            <Pressable
              onPress={() => router.navigate({ pathname: '/explore/[id]', params: { id: item.destinationId } })}
              style={({ pressed }) => [styles.card, pressed && { opacity: 0.85 }]}
            >
              <Image source={destination.image} style={styles.thumb} />
              <View style={styles.cardBody}>
                <Text style={styles.name} numberOfLines={1}>
                  {item.destinationName}
                </Text>
                <Text style={styles.meta}>{item.label}</Text>
                <Text style={styles.meta}>Fires: {formatDateTime(item.fireAt)}</Text>
                <View style={styles.statusRow}>
                  <Ionicons name={status.icon} size={14} color={status.color} />
                  <Text style={[styles.status, { color: status.color }]}>{status.label}</Text>
                </View>
              </View>
              {item.status === 'scheduled' && (
                <Pressable
                  onPress={() => setPendingCancel(item)}
                  hitSlop={10}
                  style={styles.cancelButton}
                  accessibilityLabel="Cancel reminder"
                >
                  <Ionicons name="close-circle" size={26} color={COLORS.danger} />
                </Pressable>
              )}
            </Pressable>
          );
        }}
        ListEmptyComponent={
          <EmptyState
            icon="notifications-off-outline"
            title="No reminders yet"
            message={'Open any destination and tap "Set a visit reminder" to schedule a local notification.'}
            actionLabel="Browse destinations"
            onAction={() => router.navigate('/explore')}
          />
        }
      />

      <ConfirmModal
        visible={!!pendingCancel}
        destructive
        icon="notifications-off-outline"
        title="Cancel this reminder?"
        message={pendingCancel ? `You will not be notified about ${pendingCancel.destinationName}.` : ''}
        confirmLabel="Cancel reminder"
        cancelLabel="Keep"
        onCancel={() => setPendingCancel(null)}
        onConfirm={async () => {
          const reminder = pendingCancel;
          setPendingCancel(null);
          await cancelReminderById(reminder.id);
        }}
      />
    </View>
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  headerText: {
    color: COLORS.textMuted,
    fontSize: 13,
  },
  clearText: {
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: 13,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    ...SHADOW,
  },
  thumb: {
    width: 64,
    height: 64,
    borderRadius: RADIUS.md,
  },
  cardBody: {
    flex: 1,
    marginLeft: SPACING.md,
    gap: 2,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  meta: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  status: {
    fontSize: 12,
    fontWeight: '700',
  },
  cancelButton: {
    paddingLeft: SPACING.sm,
  },
});
