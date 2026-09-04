import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { SelectableChip, SelectableChipGroup } from '@/src/components/SelectableChip';
import { Typography } from '@/src/components/Typography';
import { colors, radius, space } from '@/src/theme';

export type ChipMultiSelectProps = {
  options: readonly string[];
  selected: string[];
  onChange: (next: string[]) => void;
  allowCustom?: boolean;
  customLabel?: string;
};

export function ChipMultiSelect({
  options,
  selected,
  onChange,
  allowCustom = true,
  customLabel = '+ Outros',
}: ChipMultiSelectProps) {
  const [customOpen, setCustomOpen] = useState(false);
  const [customValue, setCustomValue] = useState('');

  const customItems = useMemo(
    () => selected.filter((item) => !options.includes(item)),
    [options, selected],
  );

  const toggle = (item: string) => {
    if (selected.includes(item)) {
      onChange(selected.filter((value) => value !== item));
      return;
    }
    onChange([...selected, item]);
  };

  const addCustom = () => {
    const value = customValue.trim();
    if (!value) {
      return;
    }
    if (!selected.includes(value)) {
      onChange([...selected, value]);
    }
    setCustomValue('');
    setCustomOpen(false);
  };

  return (
    <View style={styles.wrapper}>
      <SelectableChipGroup>
        {options.map((option) => (
          <SelectableChip
            key={option}
            label={option}
            selected={selected.includes(option)}
            onPress={() => toggle(option)}
          />
        ))}
        {customItems.map((item) => (
          <SelectableChip
            key={item}
            label={item}
            selected
            onPress={() => toggle(item)}
          />
        ))}
        {allowCustom ? (
          <SelectableChip
            label={customLabel}
            selected={customOpen}
            onPress={() => setCustomOpen((value) => !value)}
          />
        ) : null}
      </SelectableChipGroup>

      {customOpen ? (
        <View style={styles.customRow}>
          <TextInput
            value={customValue}
            onChangeText={setCustomValue}
            placeholder="Digite e confirme"
            placeholderTextColor={colors.textMuted}
            style={styles.input}
          />
          <Pressable
            accessibilityRole="button"
            onPress={addCustom}
            style={styles.addButton}
          >
            <Typography variant="label" color={colors.textOnPrimary}>
              Add
            </Typography>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: space[3],
  },
  customRow: {
    flexDirection: 'row',
    gap: space[2],
  },
  input: {
    flex: 1,
    minHeight: 48,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: space[4],
    fontFamily: 'SourceSans3_400Regular',
    color: colors.text,
    backgroundColor: colors.background,
  },
  addButton: {
    minHeight: 48,
    paddingHorizontal: space[4],
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
