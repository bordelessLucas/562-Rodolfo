import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { Typography } from '@/src/components/Typography';
import { colors, radius, space } from '@/src/theme';

export type InlineMessageVariant = 'error' | 'success' | 'info';

export type InlineMessageProps = {
  message: string;
  variant?: InlineMessageVariant;
};

const variantConfig: Record<
  InlineMessageVariant,
  { icon: keyof typeof Ionicons.glyphMap; color: string; background: string }
> = {
  error: {
    icon: 'alert-circle-outline',
    color: colors.error,
    background: '#F8EAEA',
  },
  success: {
    icon: 'checkmark-circle-outline',
    color: colors.success,
    background: '#E8F5EE',
  },
  info: {
    icon: 'information-circle-outline',
    color: colors.primary,
    background: colors.backgroundAccent,
  },
};

export function InlineMessage({
  message,
  variant = 'info',
}: InlineMessageProps) {
  const config = variantConfig[variant];

  return (
    <View
      accessibilityRole="text"
      style={[styles.box, { backgroundColor: config.background }]}
    >
      <Ionicons name={config.icon} size={18} color={config.color} />
      <Typography variant="caption" color={config.color} style={styles.text}>
        {message}
      </Typography>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: space[2],
    paddingVertical: space[3],
    paddingHorizontal: space[4],
    borderRadius: radius.md,
  },
  text: {
    flex: 1,
  },
});
