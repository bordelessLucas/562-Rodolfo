import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Typography } from '@/src/components/Typography';
import { colors, radius, space } from '@/src/theme';
import { formatDateLabel, isToday } from '@/src/utils/navigation';

export type DateNavigatorProps = {
  dateKey: string;
  onPrevious: () => void;
  onNext: () => void;
  onToday?: () => void;
  disableNext?: boolean;
};

export function DateNavigator({
  dateKey,
  onPrevious,
  onNext,
  onToday,
  disableNext = false,
}: DateNavigatorProps) {
  const today = isToday(dateKey);

  return (
    <View style={styles.wrapper}>
      <View style={styles.row}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Dia anterior"
          onPress={onPrevious}
          hitSlop={8}
          style={({ pressed }) => [styles.arrow, pressed && styles.pressed]}
        >
          <Ionicons name="chevron-back" size={22} color={colors.primary} />
        </Pressable>

        <View style={styles.center}>
          <Typography variant="h3" align="center">
            {formatDateLabel(dateKey)}
          </Typography>
          {today ? (
            <View style={styles.todayBadge}>
              <Typography variant="caption" color={colors.primary}>
                Hoje
              </Typography>
            </View>
          ) : null}
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Próximo dia"
          onPress={onNext}
          disabled={disableNext}
          hitSlop={8}
          style={({ pressed }) => [
            styles.arrow,
            disableNext && styles.arrowDisabled,
            pressed && !disableNext && styles.pressed,
          ]}
        >
          <Ionicons
            name="chevron-forward"
            size={22}
            color={disableNext ? colors.border : colors.primary}
          />
        </Pressable>
      </View>

      {!today && onToday ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Ir para hoje"
          onPress={onToday}
          style={styles.todayLink}
        >
          <Typography variant="label" color={colors.primary} align="center">
            Voltar para hoje
          </Typography>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: space[3],
    paddingHorizontal: space[2],
    gap: space[2],
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  arrow: {
    width: 44,
    height: 44,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.backgroundAccent,
  },
  arrowDisabled: {
    backgroundColor: colors.background,
  },
  pressed: {
    opacity: 0.85,
  },
  center: {
    flex: 1,
    gap: space[1],
    alignItems: 'center',
  },
  todayBadge: {
    backgroundColor: colors.backgroundAccent,
    paddingHorizontal: space[3],
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  todayLink: {
    minHeight: 36,
    justifyContent: 'center',
  },
});
