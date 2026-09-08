import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Typography } from '@/src/components/Typography';
import { colors, space } from '@/src/theme';

export type ScreenHeaderProps = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  /** Quando informado, exibe botão voltar acima do título. */
  onBack?: () => void;
  backLabel?: string;
};

export function ScreenHeader({
  eyebrow,
  title,
  subtitle,
  onBack,
  backLabel = 'Voltar',
}: ScreenHeaderProps) {
  return (
    <View style={styles.wrapper}>
      {onBack ? (
        <Pressable
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel={backLabel}
          hitSlop={8}
          style={({ pressed }) => [
            styles.backRow,
            pressed ? styles.backPressed : null,
          ]}
        >
          <Ionicons name="chevron-back" size={20} color={colors.primary} />
          <Typography variant="label" color={colors.primary}>
            {backLabel}
          </Typography>
        </Pressable>
      ) : null}
      {eyebrow ? (
        <Typography
          variant="caption"
          color={colors.secondary}
          style={styles.eyebrow}
        >
          {eyebrow}
        </Typography>
      ) : null}
      <Typography variant="h1" accessibilityRole="header">
        {title}
      </Typography>
      {subtitle ? (
        <Typography
          variant="body"
          color={colors.textMuted}
          style={styles.subtitle}
        >
          {subtitle}
        </Typography>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: space[2],
    marginBottom: space[1],
  },
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: space[1],
    marginBottom: space[1],
    marginLeft: -space[1],
  },
  backPressed: {
    opacity: 0.7,
  },
  eyebrow: {
    letterSpacing: 0.7,
    textTransform: 'uppercase',
  },
  subtitle: {
    lineHeight: 24,
  },
});
