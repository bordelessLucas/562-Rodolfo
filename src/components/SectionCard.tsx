import React from 'react';
import { StyleSheet, View } from 'react-native';

import { Typography } from '@/src/components/Typography';
import { colors, radius, space } from '@/src/theme';

export type SectionCardProps = {
  title: string;
  description?: string;
  children: React.ReactNode;
};

export function SectionCard({
  title,
  description,
  children,
}: SectionCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.accent} />
      <View style={styles.inner}>
        <Typography variant="h3">{title}</Typography>
        {description ? (
          <Typography variant="caption" color={colors.textMuted}>
            {description}
          </Typography>
        ) : null}
        <View style={styles.body}>{children}</View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  accent: {
    width: 4,
    backgroundColor: colors.backgroundAccent,
  },
  inner: {
    flex: 1,
    padding: space[5],
    gap: space[3],
  },
  body: {
    gap: space[3],
    marginTop: space[1],
  },
});
