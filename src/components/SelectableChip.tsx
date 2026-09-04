import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Typography } from '@/src/components/Typography';
import { colors, radius, space } from '@/src/theme';

export type SelectableChipProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
  disabled?: boolean;
};

export function SelectableChip({
  label,
  selected,
  onPress,
  disabled = false,
}: SelectableChipProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected, disabled }}
      accessibilityLabel={label}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        selected && styles.chipSelected,
        pressed && !disabled && styles.chipPressed,
        disabled && styles.chipDisabled,
      ]}
    >
      <Typography
        variant="label"
        color={selected ? colors.textOnPrimary : colors.text}
        align="center"
      >
        {selected ? `✓  ${label}` : label}
      </Typography>
    </Pressable>
  );
}

export type SelectableChipGroupProps = {
  children: React.ReactNode;
};

export function SelectableChipGroup({ children }: SelectableChipGroupProps) {
  return <View style={styles.group}>{children}</View>;
}

const styles = StyleSheet.create({
  group: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space[2],
  },
  chip: {
    flexGrow: 1,
    minWidth: '46%',
    minHeight: 48,
    justifyContent: 'center',
    paddingVertical: space[3],
    paddingHorizontal: space[4],
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  chipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.92,
  },
  chipDisabled: {
    opacity: 0.45,
  },
});
