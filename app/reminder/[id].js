/**
 * /reminder/[id] – SET REMINDER screen (presented as a modal by the root Stack)
 *
 * Lets the user pick when to be reminded about a destination and schedules
 * a local notification. After scheduling, or when "Cancel" is pressed, the
 * modal is dismissed with router.back().
 */
import { useState } from 'react';
import { ActivityIndicator, Alert, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import EmptyState from '../../components/EmptyState';
import { getDestinationById } from '../../data/destinations';
import { useApp } from '../../context/AppContext';
import { REMINDER_OPTIONS, notificationsSupported } from '../../services/notifications';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';
import { formatDateTime } from '../../utils/format';

export default function ReminderModal() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { addReminder } = useApp();
  const [selectedKey, setSelectedKey] = useState(REMINDER_OPTIONS[0].key);
  const [saving, setSaving] = useState(false);

  const destination = getDestinationById(id);
  if (!destination) {
    return (
      <EmptyState
        icon="help-circle-outline"
        title="Destination not found"
        message="This reminder link is not valid."
        actionLabel="Close"
        onAction={() => router.back()}
      />
    );
  }

  const handleSchedule = async () => {
    const option = REMINDER_OPTIONS.find((o) => o.key === selectedKey);
    setSaving(true);
    try {
      const reminder = await addReminder(destination.id, option);
      router.back(); // dismiss the modal
      Alert.alert('Reminder scheduled ⏰', `We'll remind you about ${destination.name} on ${formatDateTime(reminder.fireAt)}.`);
    } catch (error) {
      Alert.alert('Could not schedule reminder', error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.screen}>
      <View style={styles.destination}>
        <Image source={destination.image} style={styles.thumb} />
        <View style={styles.destinationText}>
          <Text style={styles.name}>{destination.name}</Text>
          <Text style={styles.meta}>{destination.openingHours}</Text>
        </View>
      </View>

      <Text style={styles.section}>Remind me</Text>
      {REMINDER_OPTIONS.map((option) => {
        const selected = option.key === selectedKey;
        return (
          <Pressable
            key={option.key}
            onPress={() => setSelectedKey(option.key)}
            style={[styles.option, selected && styles.optionSelected]}
          >
            <Ionicons name={option.icon} size={22} color={selected ? COLORS.primary : COLORS.textMuted} />
            <View style={styles.optionText}>
              <Text style={styles.optionLabel}>{option.label}</Text>
              <Text style={styles.optionDescription}>{option.description}</Text>
            </View>
            <Ionicons
              name={selected ? 'radio-button-on' : 'radio-button-off'}
              size={22}
              color={selected ? COLORS.primary : COLORS.border}
            />
          </Pressable>
        );
      })}

      {!notificationsSupported && (
        <Text style={styles.warning}>Local notifications are not available on the web. Run the app on Android or iOS.</Text>
      )}

      <View style={styles.footer}>
        <Pressable style={[styles.button, styles.cancel]} onPress={() => router.back()}>
          <Text style={styles.cancelText}>Cancel</Text>
        </Pressable>
        <Pressable
          style={[styles.button, styles.confirm, saving && { opacity: 0.6 }]}
          onPress={handleSchedule}
          disabled={saving}
        >
          {saving ? <ActivityIndicator color={COLORS.white} /> : <Text style={styles.confirmText}>Schedule</Text>}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SPACING.lg,
  },
  destination: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
  },
  thumb: {
    width: 70,
    height: 70,
    borderRadius: RADIUS.md,
  },
  destinationText: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  name: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.text,
  },
  meta: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  section: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    marginTop: SPACING.xl,
    marginBottom: SPACING.sm,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  optionSelected: {
    borderColor: COLORS.primary,
    backgroundColor: '#F0FDFA',
  },
  optionText: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
  },
  optionDescription: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  warning: {
    color: COLORS.danger,
    marginTop: SPACING.md,
    fontSize: 13,
  },
  footer: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: 'auto',
    paddingBottom: SPACING.lg,
  },
  button: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: RADIUS.md,
  },
  cancel: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cancelText: {
    color: COLORS.text,
    fontWeight: '700',
    fontSize: 15,
  },
  confirm: {
    backgroundColor: COLORS.primary,
  },
  confirmText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 15,
  },
});
