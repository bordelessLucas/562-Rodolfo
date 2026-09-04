import React from 'react';
import { StyleSheet, View } from 'react-native';

import { Typography } from '@/src/components/Typography';
import { colors, space } from '@/src/theme';

export type ScreenHeaderProps = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
};

export function ScreenHeader({ eyebrow, title, subtitle }: ScreenHeaderProps) {
  return (
    <View style={styles.wrapper}>
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
        <Typography variant="body" color={colors.textMuted} style={styles.subtitle}>
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
  eyebrow: {
    letterSpacing: 0.7,
    textTransform: 'uppercase',
  },
  subtitle: {
    lineHeight: 24,
  },
});
