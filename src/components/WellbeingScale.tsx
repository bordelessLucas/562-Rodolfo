import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Typography } from '@/src/components/Typography';
import { colors, radius, space } from '@/src/theme';

export type WellbeingScaleProps = {
  label: string;
  lowLabel: string;
  highLabel: string;
  value: number | null;
  onChange: (value: number) => void;
  disabled?: boolean;
};

const SCALE = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;

export function WellbeingScale({
  label,
  lowLabel,
  highLabel,
  value,
  onChange,
  disabled = false,
}: WellbeingScaleProps) {
  return (
    <View style={styles.wrapper}>
      <Typography variant="label">{label}</Typography>
      <View style={styles.row}>
        {SCALE.map((item) => {
          const selected = value === item;
          return (
            <Pressable
              key={item}
              accessibilityRole="button"
              accessibilityState={{ selected, disabled }}
              accessibilityLabel={`${label}: ${item}`}
              disabled={disabled}
              onPress={() => onChange(item)}
              style={({ pressed }) => [
                styles.cell,
                selected && styles.cellSelected,
                pressed && !disabled && styles.cellPressed,
                disabled && !selected && styles.cellDisabled,
              ]}
            >
              <Typography
                variant="caption"
                color={selected ? colors.textOnPrimary : colors.text}
                align="center"
              >
                {item}
              </Typography>
            </Pressable>
          );
        })}
      </View>
      <View style={styles.legend}>
        <Typography variant="caption" color={colors.textMuted}>
          {lowLabel}
        </Typography>
        <Typography variant="caption" color={colors.textMuted}>
          {highLabel}
        </Typography>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: space[2],
    paddingVertical: space[2],
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 2,
  },
  cell: {
    flex: 1,
    minHeight: 40,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  cellPressed: {
    opacity: 0.9,
  },
  cellDisabled: {
    opacity: 0.55,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
