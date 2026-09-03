import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { colors, fonts, fontSizes, radius, space } from '@/src/theme';

export type InputProps = TextInputProps & {
  label?: string;
  error?: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  isPassword?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
};

export function Input({
  label,
  error,
  leftIcon,
  isPassword = false,
  containerStyle,
  secureTextEntry,
  ...textInputProps
}: InputProps) {
  const [hidden, setHidden] = useState(isPassword);
  const hasError = Boolean(error);

  return (
    <View style={[styles.wrapper, containerStyle]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}

      <View
        style={[
          styles.field,
          hasError && styles.fieldError,
          textInputProps.editable === false && styles.fieldDisabled,
        ]}
      >
        {leftIcon ? (
          <Ionicons
            name={leftIcon}
            size={20}
            color={hasError ? colors.error : colors.textMuted}
            style={styles.leftIcon}
          />
        ) : null}

        <TextInput
          placeholderTextColor={colors.textMuted}
          secureTextEntry={isPassword ? hidden : secureTextEntry}
          style={styles.input}
          accessibilityLabel={label}
          {...textInputProps}
        />

        {isPassword ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={hidden ? 'Mostrar senha' : 'Ocultar senha'}
            hitSlop={8}
            onPress={() => setHidden((value) => !value)}
            style={styles.eyeButton}
          >
            <Ionicons
              name={hidden ? 'eye-outline' : 'eye-off-outline'}
              size={20}
              color={colors.textMuted}
            />
          </Pressable>
        ) : null}
      </View>

      {hasError ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    gap: space[2],
  },
  label: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSizes.label,
    color: colors.text,
  },
  field: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: space[4],
  },
  fieldError: {
    borderColor: colors.error,
  },
  fieldDisabled: {
    opacity: 0.55,
  },
  leftIcon: {
    marginRight: space[2],
  },
  input: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: fontSizes.body,
    color: colors.text,
    paddingVertical: space[3],
  },
  eyeButton: {
    marginLeft: space[2],
    padding: space[1],
  },
  error: {
    fontFamily: fonts.body,
    fontSize: fontSizes.caption,
    color: colors.error,
  },
});
