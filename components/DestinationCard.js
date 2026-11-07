/**
 * A single row in the Explore / Favourites FlatList.
 * Core components: Pressable, View, Image, Text.
 */
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { CATEGORY_META } from '../data/destinations';
import { COLORS, RADIUS, SHADOW, SPACING } from '../constants/theme';
import { formatCount } from '../utils/format';

export default function DestinationCard({ destination, isFavorite, onPress, onToggleFavorite, compact = false }) {
  const meta = CATEGORY_META[destination.category];

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, compact && styles.compactCard, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel={`Open ${destination.name}`}
    >
      <Image source={destination.image} style={compact ? styles.compactImage : styles.image} resizeMode="cover" />

      <View style={styles.body}>
        <View style={styles.row}>
          <View style={[styles.badge, { backgroundColor: `${meta.color}1A` }]}>
            <Ionicons name={meta.icon} size={12} color={meta.color} />
            <Text style={[styles.badgeText, { color: meta.color }]}>{destination.category}</Text>
          </View>
          {destination.entryFee.free && <Text style={styles.free}>FREE ENTRY</Text>}
        </View>

        <Text style={styles.name} numberOfLines={1}>
          {destination.name}
        </Text>
        {!compact && (
          <Text style={styles.tagline} numberOfLines={1}>
            {destination.tagline}
          </Text>
        )}

        <View style={styles.metaRow}>
          <Ionicons name="location-outline" size={14} color={COLORS.textMuted} />
          <Text style={styles.metaText}>
            {destination.district} · {destination.distanceFromColombo} km
          </Text>
          <Ionicons name="star" size={14} color={COLORS.accent} style={styles.star} />
          <Text style={styles.metaText}>
            {destination.rating} ({formatCount(destination.reviews)})
          </Text>
        </View>
      </View>

      {onToggleFavorite && (
        <Pressable
          onPress={onToggleFavorite}
          hitSlop={10}
          style={({ pressed }) => [styles.heart, pressed && styles.pressed]}
          accessibilityLabel={isFavorite ? 'Remove from favourites' : 'Add to favourites'}
        >
          <Ionicons name={isFavorite ? 'heart' : 'heart-outline'} size={22} color={isFavorite ? COLORS.danger : COLORS.white} />
        </Pressable>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.lg,
    overflow: 'hidden',
    ...SHADOW,
  },
  compactCard: {
    flexDirection: 'row',
  },
  pressed: {
    opacity: 0.85,
  },
  image: {
    width: '100%',
    height: 170,
  },
  compactImage: {
    width: 110,
    height: 110,
  },
  body: {
    flex: 1,
    padding: SPACING.md,
    gap: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.pill,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  free: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.success,
    letterSpacing: 0.5,
  },
  name: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.text,
  },
  tagline: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 2,
  },
  metaText: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  star: {
    marginLeft: SPACING.sm,
  },
  heart: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderRadius: RADIUS.pill,
    padding: 6,
  },
});
