/**
 * Full details of one destination.
 * Rendered by BOTH app/(tabs)/explore/[id].js and app/(tabs)/favorites/[id].js
 * so each tab keeps its own back stack.
 */
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { CATEGORY_META, getDestinationById } from '../data/destinations';
import { useApp } from '../context/AppContext';
import { COLORS, RADIUS, SHADOW, SPACING } from '../constants/theme';
import { formatCount } from '../utils/format';
import EmptyState from './EmptyState';

function InfoRow({ icon, label, value }) {
  return (
    <View style={styles.infoRow}>
      <Ionicons name={icon} size={20} color={COLORS.primary} style={styles.infoIcon} />
      <View style={styles.infoTextWrap}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

export default function DestinationDetail({ id }) {
  const router = useRouter();
  const { isFavorite, toggleFavorite, isVisited, toggleVisited, reminders } = useApp();
  const destination = getDestinationById(id);

  if (!destination) {
    return (
      <EmptyState
        icon="help-circle-outline"
        title="Destination not found"
        message={`We couldn't find a destination with id "${id}".`}
        actionLabel="Go back"
        onAction={() => router.back()}
      />
    );
  }

  const favorite = isFavorite(destination.id);
  const visited = isVisited(destination.id);
  const meta = CATEGORY_META[destination.category];
  const activeReminders = reminders.filter(
    (r) => r.destinationId === destination.id && r.status === 'scheduled'
  ).length;

  return (
    <>
      {/* Configure the parent Stack header from inside the screen */}
      <Stack.Screen
        options={{
          title: destination.name,
          headerRight: () => (
            <Pressable onPress={() => toggleFavorite(destination.id)} hitSlop={10} accessibilityLabel="Toggle favourite">
              <Ionicons
                name={favorite ? 'heart' : 'heart-outline'}
                size={24}
                color={favorite ? COLORS.danger : COLORS.white}
              />
            </Pressable>
          ),
        }}
      />

      <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
        <Image source={destination.image} style={styles.hero} resizeMode="cover" />

        <View style={styles.card}>
          <View style={[styles.badge, { backgroundColor: `${meta.color}1A` }]}>
            <Ionicons name={meta.icon} size={13} color={meta.color} />
            <Text style={[styles.badgeText, { color: meta.color }]}>{destination.category}</Text>
          </View>

          <Text style={styles.name}>{destination.name}</Text>
          <Text style={styles.tagline}>{destination.tagline}</Text>

          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>★ {destination.rating}</Text>
              <Text style={styles.statLabel}>{formatCount(destination.reviews)} reviews</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{destination.distanceFromColombo} km</Text>
              <Text style={styles.statLabel}>from Colombo</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{destination.entryFee.free ? 'Free' : destination.entryFee.foreign}</Text>
              <Text style={styles.statLabel}>entry (foreign)</Text>
            </View>
          </View>

          {destination.unesco && (
            <View style={styles.unesco}>
              <Ionicons name="ribbon-outline" size={18} color={COLORS.accent} />
              <Text style={styles.unescoText}>{destination.unesco}</Text>
            </View>
          )}

          {/* Primary actions – these update the shared global state */}
          <View style={styles.actions}>
            <Pressable
              onPress={() => toggleFavorite(destination.id)}
              style={({ pressed }) => [styles.actionButton, favorite && styles.actionActive, pressed && styles.pressed]}
            >
              <Ionicons name={favorite ? 'heart' : 'heart-outline'} size={18} color={favorite ? COLORS.white : COLORS.primary} />
              <Text style={[styles.actionText, favorite && styles.actionTextActive]}>
                {favorite ? 'Saved' : 'Save'}
              </Text>
            </Pressable>

            <Pressable
              onPress={() => toggleVisited(destination.id)}
              style={({ pressed }) => [styles.actionButton, visited && styles.actionActive, pressed && styles.pressed]}
            >
              <Ionicons
                name={visited ? 'checkmark-circle' : 'checkmark-circle-outline'}
                size={18}
                color={visited ? COLORS.white : COLORS.primary}
              />
              <Text style={[styles.actionText, visited && styles.actionTextActive]}>
                {visited ? 'Visited' : 'Mark visited'}
              </Text>
            </Pressable>
          </View>

          <Pressable
            onPress={() => router.push({ pathname: '/reminder/[id]', params: { id: destination.id } })}
            style={({ pressed }) => [styles.reminderButton, pressed && styles.pressed]}
          >
            <Ionicons name="notifications-outline" size={20} color={COLORS.white} />
            <Text style={styles.reminderText}>
              Set a visit reminder{activeReminders > 0 ? ` (${activeReminders} active)` : ''}
            </Text>
          </Pressable>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.paragraph}>{destination.description}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Plan your visit</Text>
          <InfoRow icon="map-outline" label="Location" value={`${destination.district} District, ${destination.province} Province`} />
          <InfoRow icon="time-outline" label="Opening hours" value={destination.openingHours} />
          <InfoRow
            icon="ticket-outline"
            label="Entry fee"
            value={`Foreign adult: ${destination.entryFee.foreign}  ·  Sri Lankan: ${destination.entryFee.local}`}
          />
          <InfoRow icon="partly-sunny-outline" label="Best time to visit" value={destination.bestTime} />
          <InfoRow icon="hourglass-outline" label="Recommended duration" value={destination.visitDuration} />
          <InfoRow
            icon="navigate-outline"
            label="GPS coordinates"
            value={`${destination.coordinates.latitude}° N, ${destination.coordinates.longitude}° E`}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Highlights</Text>
          {destination.highlights.map((highlight) => (
            <View key={highlight} style={styles.bulletRow}>
              <Ionicons name="checkmark" size={16} color={COLORS.success} />
              <Text style={styles.bulletText}>{highlight}</Text>
            </View>
          ))}
        </View>

        <View style={[styles.card, styles.tipCard]}>
          <Ionicons name="bulb-outline" size={20} color={COLORS.accent} />
          <Text style={styles.tipText}>{destination.tips}</Text>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    paddingBottom: SPACING.xl * 2,
  },
  hero: {
    width: '100%',
    height: 260,
  },
  card: {
    backgroundColor: COLORS.card,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
    padding: SPACING.lg,
    borderRadius: RADIUS.lg,
    ...SHADOW,
  },
  badge: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: RADIUS.pill,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  name: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.text,
    marginTop: SPACING.sm,
  },
  tagline: {
    fontSize: 15,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: SPACING.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: COLORS.border,
    paddingVertical: SPACING.md,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  unesco: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginTop: SPACING.md,
  },
  unescoText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.text,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.lg,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  actionActive: {
    backgroundColor: COLORS.primary,
  },
  actionText: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  actionTextActive: {
    color: COLORS.white,
  },
  reminderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    marginTop: SPACING.md,
    paddingVertical: 14,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.accent,
  },
  reminderText: {
    color: COLORS.white,
    fontWeight: '800',
    fontSize: 15,
  },
  pressed: {
    opacity: 0.8,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  paragraph: {
    fontSize: 15,
    lineHeight: 23,
    color: COLORS.text,
  },
  infoRow: {
    flexDirection: 'row',
    paddingVertical: SPACING.sm,
  },
  infoIcon: {
    marginRight: SPACING.md,
    marginTop: 2,
  },
  infoTextWrap: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 15,
    color: COLORS.text,
    marginTop: 2,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingVertical: 4,
  },
  bulletText: {
    fontSize: 15,
    color: COLORS.text,
  },
  tipCard: {
    flexDirection: 'row',
    gap: SPACING.md,
    backgroundColor: '#FFFBEB',
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 21,
    color: COLORS.text,
  },
});
