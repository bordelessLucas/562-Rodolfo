import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { colors, fonts, fontSizes, radius, space } from '@/src/theme';

export type ButtonVariant = 'primary' | 'secondary' | 'outline';

export type ButtonProps = Omit<PressableProps, 'children'> & {
  label: string;
  variant?: ButtonVariant;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function Button({
  label,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
  ...pressableProps
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        variantStyles[variant],
        pressed && !isDisabled && pressedStyles[variant],
        isDisabled && styles.disabled,
        style,
      ]}
      {...pressableProps}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'outline' ? colors.primary : colors.textOnPrimary}
        />
      ) : (
        <Text style={[styles.label, labelStyles[variant]]}>{label}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 52,
    borderRadius: radius.md,
    paddingHorizontal: space[6],
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSizes.body,
  },
  disabled: {
    opacity: 0.45,
  },
});

const variantStyles = StyleSheet.create({
  primary: {
    backgroundColor: colors.primary,
  },
  secondary: {
    backgroundColor: colors.secondary,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
});

const pressedStyles = StyleSheet.create({
  primary: {
    backgroundColor: colors.primaryPressed,
  },
  secondary: {
    backgroundColor: colors.primary,
  },
  outline: {
    backgroundColor: colors.backgroundAccent,
  },
});

const labelStyles = StyleSheet.create({
  primary: {
    color: colors.textOnPrimary,
  },
  secondary: {
    color: colors.textOnPrimary,
  },
  outline: {
    color: colors.primary,
  },
});
