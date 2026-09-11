import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useCallback, useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { Typography } from '@/src/components/Typography';
import { colors, space } from '@/src/theme';

const ICON_SIZE = 22;
const HIT_SIZE = 28;

type LikeActionButtonProps = {
  liked: boolean;
  count: number;
  busy?: boolean;
  label?: string;
  /** Incrementa de fora (ex.: toque duplo na imagem) para repetir o efeito. */
  burstKey?: number;
  onPress: () => void;
};

/**
 * Botão de curtida com pop no ícone (estilo Instagram/Meta).
 */
export function LikeActionButton({
  liked,
  count,
  busy = false,
  label,
  burstKey = 0,
  onPress,
}: LikeActionButtonProps) {
  const iconScale = useSharedValue(1);
  const burstProgress = useSharedValue(0);

  const playEffect = useCallback(() => {
    iconScale.value = withSequence(
      withTiming(0.72, { duration: 70, easing: Easing.out(Easing.quad) }),
      withSpring(1.28, { damping: 9, stiffness: 220 }),
      withSpring(1, { damping: 14, stiffness: 180 }),
    );
    burstProgress.value = 0;
    burstProgress.value = withSequence(
      withTiming(1, {
        duration: 220,
        easing: Easing.out(Easing.cubic),
      }),
      withTiming(0, {
        duration: 280,
        easing: Easing.in(Easing.cubic),
      }),
    );
  }, [burstProgress, iconScale]);

  useEffect(() => {
    if (burstKey > 0) {
      playEffect();
    }
  }, [burstKey, playEffect]);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale.value }],
  }));

  const burstStyle = useAnimatedStyle(() => ({
    opacity: burstProgress.value * 0.85,
    transform: [{ scale: 0.9 + burstProgress.value * 1.35 }],
  }));

  const handlePress = () => {
    if (busy) {
      return;
    }
    playEffect();
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={liked ? 'Remover curtida' : 'Curtir'}
      disabled={busy}
      onPress={handlePress}
      style={({ pressed }) => [
        styles.row,
        pressed ? styles.pressed : null,
      ]}
    >
      <View style={styles.iconWrap}>
        <Animated.View
          pointerEvents="none"
          style={[styles.iconLayer, burstStyle]}
        >
          <Ionicons name="heart" size={ICON_SIZE} color={colors.error} />
        </Animated.View>
        <Animated.View style={[styles.iconLayer, iconStyle]}>
          <Ionicons
            name={liked ? 'heart' : 'heart-outline'}
            size={ICON_SIZE}
            color={liked ? colors.error : colors.textMuted}
          />
        </Animated.View>
      </View>
      <Typography
        variant="caption"
        color={liked ? colors.error : colors.textMuted}
      >
        {label ?? String(count)}
      </Typography>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: space[1],
    minHeight: 36,
  },
  pressed: {
    opacity: 0.85,
  },
  iconWrap: {
    width: HIT_SIZE,
    height: HIT_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconLayer: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: HIT_SIZE,
    height: HIT_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
