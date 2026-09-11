import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { colors } from '@/src/theme';

const HEART_SIZE = 84;

type LikeHeartBurstProps = {
  /** Incrementa para disparar o efeito no centro. */
  burstKey: number;
};

/**
 * Coração centralizado sobre a mídia da publicação (não ocupa layout).
 */
export function LikeHeartBurst({ burstKey }: LikeHeartBurstProps) {
  const [active, setActive] = useState(false);
  const progress = useSharedValue(0);

  useEffect(() => {
    if (burstKey <= 0) {
      return;
    }

    setActive(true);
    progress.value = withSequence(
      withTiming(1, {
        duration: 200,
        easing: Easing.out(Easing.back(2)),
      }),
      withTiming(1, { duration: 350 }),
      withTiming(
        0,
        {
          duration: 240,
          easing: Easing.in(Easing.cubic),
        },
        (finished) => {
          if (finished) {
            runOnJS(setActive)(false);
          }
        },
      ),
    );
  }, [burstKey, progress]);

  const heartStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ scale: 0.45 + progress.value * 0.55 }],
  }));

  if (!active) {
    return null;
  }

  return (
    <View pointerEvents="none" style={styles.layer}>
      <Animated.View style={[styles.heart, heartStyle]}>
        <Ionicons name="heart" size={HEART_SIZE} color={colors.error} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  layer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 50,
    elevation: 50,
  },
  heart: {
    width: HEART_SIZE,
    height: HEART_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
