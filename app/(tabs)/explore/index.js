/**
 * /explore – EXPLORE screen (home)
 *
 * Shows all hard-coded destinations in a FlatList with search,
 * a filter/sort <Modal>, and a favourite toggle on each card.
 */
import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import DestinationCard from '../../../components/DestinationCard';
import EmptyState from '../../../components/EmptyState';
import FilterModal, { DEFAULT_FILTERS } from '../../../components/FilterModal';
import { DESTINATIONS } from '../../../data/destinations';
import { useApp } from '../../../context/AppContext';
import { COLORS, RADIUS, SPACING } from '../../../constants/theme';

const SORTERS = {
  rating: (a, b) => b.rating - a.rating,
  name: (a, b) => a.name.localeCompare(b.name),
  distance: (a, b) => a.distanceFromColombo - b.distanceFromColombo,
  fee: (a, b) => a.feeUsd - b.feeUsd,
};

export default function ExploreScreen() {
  const router = useRouter();
  const { isFavorite, toggleFavorite, favorites, visited } = useApp();
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [filterVisible, setFilterVisible] = useState(false);

  // Derived list – recalculated only when the search text or filters change.
  const results = useMemo(() => {
    const text = query.trim().toLowerCase();
    return DESTINATIONS.filter((d) => filters.category === 'All' || d.category === filters.category)
      .filter((d) => !filters.freeOnly || d.entryFee.free)
      .filter((d) => !filters.unescoOnly || Boolean(d.unesco))
      .filter(
        (d) =>
          !text ||
          d.name.toLowerCase().includes(text) ||
          d.district.toLowerCase().includes(text) ||
          d.province.toLowerCase().includes(text)
      )
      .sort(SORTERS[filters.sortBy]);
  }, [query, filters]);

  const activeFilterCount =
    (filters.category !== 'All' ? 1 : 0) +
    (filters.freeOnly ? 1 : 0) +
    (filters.unescoOnly ? 1 : 0) +
    (filters.sortBy !== DEFAULT_FILTERS.sortBy ? 1 : 0);

  const header = (
    <View>
      <View style={styles.hero}>
        <Text style={styles.greeting}>Ayubowan! 🇱🇰</Text>
        <Text style={styles.heroTitle}>Where will you go in Sri Lanka?</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.summary}>{DESTINATIONS.length} places</Text>
          <Text style={styles.summary}>· {favorites.length} saved</Text>
          <Text style={styles.summary}>· {visited.length} visited</Text>
        </View>
      </View>

      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color={COLORS.textMuted} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search by name, district or province"
            placeholderTextColor={COLORS.textMuted}
            style={styles.searchInput}
            returnKeyType="search"
            clearButtonMode="while-editing"
          />
        </View>
        <Pressable
          onPress={() => setFilterVisible(true)}
          style={({ pressed }) => [styles.filterButton, pressed && { opacity: 0.8 }]}
          accessibilityLabel="Open filters"
        >
          <Ionicons name="options-outline" size={22} color={COLORS.white} />
          {activeFilterCount > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
            </View>
          )}
        </Pressable>
      </View>

      <Text style={styles.resultCount}>
        Showing {results.length} destination{results.length === 1 ? '' : 's'}
        {filters.category !== 'All' ? ` in ${filters.category}` : ''}
      </Text>
    </View>
  );

  return (
    <View style={styles.screen}>
      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={header}
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) => (
          <DestinationCard
            destination={item}
            isFavorite={isFavorite(item.id)}
            onPress={() => router.push({ pathname: '/explore/[id]', params: { id: item.id } })}
            onToggleFavorite={() => toggleFavorite(item.id)}
          />
        )}
        ListEmptyComponent={
          <EmptyState
            icon="search-outline"
            title="No destinations match"
            message="Try a different search term or reset the filters."
            actionLabel="Reset filters"
            onAction={() => {
              setQuery('');
              setFilters(DEFAULT_FILTERS);
            }}
          />
        }
      />

      <FilterModal
        visible={filterVisible}
        filters={filters}
        onClose={() => setFilterVisible(false)}
        onApply={(next) => {
          setFilters(next);
          setFilterVisible(false);
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
  hero: {
    backgroundColor: COLORS.primaryDark,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  greeting: {
    color: COLORS.primaryLight,
    fontSize: 14,
    fontWeight: '600',
  },
  heroTitle: {
    color: COLORS.white,
    fontSize: 22,
    fontWeight: '800',
    marginTop: 4,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 4,
    marginTop: SPACING.sm,
  },
  summary: {
    color: COLORS.primaryLight,
    fontSize: 13,
  },
  searchRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
    color: COLORS.text,
  },
  filterButton: {
    width: 48,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBadgeText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: '800',
  },
  resultCount: {
    color: COLORS.textMuted,
    fontSize: 13,
    marginVertical: SPACING.md,
  },
});
