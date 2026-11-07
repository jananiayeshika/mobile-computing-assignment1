/**
 * Bottom-sheet style <Modal> used on the Explore screen to FILTER and SORT
 * the destination list. Changes are kept in a local draft and only applied
 * when the user taps "Show results".
 */
import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { CATEGORIES, SORT_OPTIONS } from '../data/destinations';
import { COLORS, RADIUS, SPACING } from '../constants/theme';

export const DEFAULT_FILTERS = { category: 'All', sortBy: 'rating', freeOnly: false, unescoOnly: false };

export default function FilterModal({ visible, filters, onApply, onClose }) {
  const [draft, setDraft] = useState(filters);

  const update = (key, value) => setDraft((current) => ({ ...current, [key]: value }));

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose} // Android hardware back button
      onShow={() => setDraft(filters)} // start from the currently applied filters
    >
      <View style={styles.backdrop}>
        {/* Tapping the dark area closes the modal */}
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Close filters" />

        <View style={styles.sheet}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <Text style={styles.title}>Filter & sort</Text>
            <Pressable onPress={onClose} hitSlop={10} accessibilityLabel="Close">
              <Ionicons name="close" size={24} color={COLORS.text} />
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={styles.content}>
            <Text style={styles.section}>Category</Text>
            <View style={styles.chips}>
              {CATEGORIES.map((category) => {
                const selected = draft.category === category;
                return (
                  <Pressable
                    key={category}
                    onPress={() => update('category', category)}
                    style={[styles.chip, selected && styles.chipSelected]}
                  >
                    <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{category}</Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={styles.section}>Sort by</Text>
            {SORT_OPTIONS.map((option) => {
              const selected = draft.sortBy === option.key;
              return (
                <Pressable key={option.key} onPress={() => update('sortBy', option.key)} style={styles.radioRow}>
                  <Ionicons
                    name={selected ? 'radio-button-on' : 'radio-button-off'}
                    size={20}
                    color={selected ? COLORS.primary : COLORS.textMuted}
                  />
                  <Text style={styles.radioText}>{option.label}</Text>
                </Pressable>
              );
            })}

            <Text style={styles.section}>Options</Text>
            <View style={styles.switchRow}>
              <Text style={styles.radioText}>Free entry only</Text>
              <Switch
                value={draft.freeOnly}
                onValueChange={(value) => update('freeOnly', value)}
                trackColor={{ true: COLORS.primary }}
              />
            </View>
            <View style={styles.switchRow}>
              <Text style={styles.radioText}>UNESCO World Heritage only</Text>
              <Switch
                value={draft.unescoOnly}
                onValueChange={(value) => update('unescoOnly', value)}
                trackColor={{ true: COLORS.primary }}
              />
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <Pressable style={[styles.button, styles.secondary]} onPress={() => setDraft(DEFAULT_FILTERS)}>
              <Text style={styles.secondaryText}>Reset</Text>
            </Pressable>
            <Pressable style={[styles.button, styles.primary]} onPress={() => onApply(draft)}>
              <Text style={styles.primaryText}>Show results</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: COLORS.overlay,
  },
  sheet: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: RADIUS.lg,
    borderTopRightRadius: RADIUS.lg,
    maxHeight: '85%',
    paddingBottom: SPACING.xl,
  },
  handle: {
    alignSelf: 'center',
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: COLORS.border,
    marginTop: SPACING.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
  },
  content: {
    paddingHorizontal: SPACING.lg,
  },
  section: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  chip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chipSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  chipText: {
    color: COLORS.text,
    fontWeight: '600',
  },
  chipTextSelected: {
    color: COLORS.white,
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.sm,
  },
  radioText: {
    fontSize: 15,
    color: COLORS.text,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.xs,
  },
  footer: {
    flexDirection: 'row',
    gap: SPACING.md,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
  },
  button: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: RADIUS.md,
  },
  primary: {
    backgroundColor: COLORS.primary,
  },
  primaryText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 15,
  },
  secondary: {
    backgroundColor: COLORS.background,
  },
  secondaryText: {
    color: COLORS.text,
    fontWeight: '700',
    fontSize: 15,
  },
});
