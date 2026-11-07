/**
 * /favorites – FAVOURITES screen
 *
 * Reads the SHARED `favorites` state, so anything hearted on the Explore
 * or Detail screens appears here instantly. Removing a favourite asks for
 * confirmation through <ConfirmModal>.
 */
import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import DestinationCard from '../../../components/DestinationCard';
import ConfirmModal from '../../../components/ConfirmModal';
import EmptyState from '../../../components/EmptyState';
import { getDestinationById } from '../../../data/destinations';
import { useApp } from '../../../context/AppContext';
import { COLORS, RADIUS, SPACING } from '../../../constants/theme';

export default function FavoritesScreen() {
  const router = useRouter();
  const { favorites, removeFavorite, isVisited } = useApp();
  const [pendingRemoval, setPendingRemoval] = useState(null);

  const items = useMemo(() => favorites.map(getDestinationById).filter(Boolean), [favorites]);

  const totalFeeUsd = items.reduce((sum, d) => sum + d.feeUsd, 0);

  return (
    <View style={styles.screen}>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          items.length > 0 ? (
            <View style={styles.summary}>
              <Ionicons name="heart" size={20} color={COLORS.danger} />
              <Text style={styles.summaryText}>
                {items.length} saved · approx. USD {totalFeeUsd} in entry tickets (foreign adult)
              </Text>
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <View>
            <DestinationCard
              compact
              destination={item}
              onPress={() => router.push({ pathname: '/favorites/[id]', params: { id: item.id } })}
            />
            <View style={styles.cardActions}>
              {isVisited(item.id) && (
                <View style={styles.visitedTag}>
                  <Ionicons name="checkmark-circle" size={14} color={COLORS.success} />
                  <Text style={styles.visitedText}>Visited</Text>
                </View>
              )}
              <Pressable
                onPress={() => setPendingRemoval(item)}
                hitSlop={8}
                style={({ pressed }) => [styles.removeButton, pressed && { opacity: 0.7 }]}
                accessibilityLabel={`Remove ${item.name}`}
              >
                <Ionicons name="trash-outline" size={16} color={COLORS.danger} />
                <Text style={styles.removeText}>Remove</Text>
              </Pressable>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <EmptyState
            icon="heart-dislike-outline"
            title="No favourites yet"
            message="Tap the heart on any destination to save it here for your trip."
            actionLabel="Explore destinations"
            onAction={() => router.navigate('/explore')}
          />
        }
      />

      <ConfirmModal
        visible={!!pendingRemoval}
        destructive
        icon="heart-dislike-outline"
        title="Remove from favourites?"
        message={pendingRemoval ? `${pendingRemoval.name} will be removed from your wishlist.` : ''}
        confirmLabel="Remove"
        onCancel={() => setPendingRemoval(null)}
        onConfirm={() => {
          removeFavorite(pendingRemoval.id);
          setPendingRemoval(null);
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
  summary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.dangerLight,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.lg,
  },
  summaryText: {
    flex: 1,
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '600',
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: SPACING.md,
    marginTop: -SPACING.sm,
    marginBottom: SPACING.lg,
  },
  visitedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  visitedText: {
    color: COLORS.success,
    fontWeight: '700',
    fontSize: 13,
  },
  removeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  removeText: {
    color: COLORS.danger,
    fontWeight: '700',
    fontSize: 13,
  },
});
