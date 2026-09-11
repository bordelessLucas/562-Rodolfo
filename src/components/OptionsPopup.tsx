import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { Typography } from '@/src/components/Typography';
import { colors, radius, space } from '@/src/theme';

export type OptionsPopupItem = {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  hint?: string;
  destructive?: boolean;
  disabled?: boolean;
  onPress: () => void;
};

export type OptionsPopupProps = {
  visible: boolean;
  title: string;
  items: OptionsPopupItem[];
  onClose: () => void;
};

export function OptionsPopup({
  visible,
  title,
  items,
  onClose,
}: OptionsPopupProps) {
  const [mounted, setMounted] = useState(visible);
  const progress = useSharedValue(visible ? 1 : 0);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      progress.value = withTiming(1, {
        duration: 200,
        easing: Easing.out(Easing.cubic),
      });
      return;
    }

    progress.value = withTiming(
      0,
      {
        duration: 150,
        easing: Easing.in(Easing.cubic),
      },
      (finished) => {
        if (finished) {
          runOnJS(setMounted)(false);
        }
      },
    );
  }, [progress, visible]);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
  }));

  const cardStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [
      {
        scale: 0.94 + progress.value * 0.06,
      },
    ],
  }));

  return (
    <Modal
      visible={mounted}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.root}>
        <Animated.View
          pointerEvents="box-none"
          style={[StyleSheet.absoluteFill, backdropStyle]}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Fechar menu"
            style={[StyleSheet.absoluteFill, styles.backdropFill]}
            onPress={onClose}
          />
        </Animated.View>

        <Animated.View style={[styles.card, cardStyle]}>
          <Typography variant="label" color={colors.textMuted}>
            {title}
          </Typography>

          {items.map((item) => {
            const tone = item.destructive ? colors.error : colors.text;
            return (
              <Pressable
                key={item.id}
                accessibilityRole="button"
                accessibilityState={{ disabled: item.disabled }}
                disabled={item.disabled}
                onPress={item.onPress}
                style={({ pressed }) => [
                  styles.option,
                  pressed && !item.disabled ? styles.optionPressed : null,
                  item.disabled ? styles.optionDisabled : null,
                ]}
              >
                <View
                  style={[
                    styles.optionIcon,
                    item.destructive ? styles.optionIconDanger : null,
                  ]}
                >
                  <Ionicons name={item.icon} size={20} color={tone} />
                </View>
                <View style={styles.optionText}>
                  <Typography variant="bodyStrong" color={tone}>
                    {item.label}
                  </Typography>
                  {item.hint ? (
                    <Typography variant="caption" color={colors.textMuted}>
                      {item.hint}
                    </Typography>
                  ) : null}
                </View>
              </Pressable>
            );
          })}

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Cancelar"
            onPress={onClose}
            style={({ pressed }) => [
              styles.cancel,
              pressed ? styles.optionPressed : null,
            ]}
          >
            <Typography
              variant="bodyStrong"
              color={colors.primary}
              align="center"
            >
              Cancelar
            </Typography>
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: space[6],
  },
  backdropFill: {
    backgroundColor: colors.overlay,
  },
  card: {
    gap: space[3],
    padding: space[5],
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
    paddingVertical: space[3],
    paddingHorizontal: space[3],
    borderRadius: radius.md,
    backgroundColor: colors.backgroundAccent,
  },
  optionPressed: {
    opacity: 0.75,
  },
  optionDisabled: {
    opacity: 0.5,
  },
  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  optionIconDanger: {
    backgroundColor: '#F8E8E8',
  },
  optionText: {
    flex: 1,
    gap: 2,
  },
  cancel: {
    paddingVertical: space[3],
  },
});
