import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Typography } from '@/src/components/Typography';
import { colors, radius, space } from '@/src/theme';

export type ToastVariant = 'success' | 'error' | 'info';

export type ToastInput = {
  message: string;
  variant?: ToastVariant;
  durationMs?: number;
};

type ToastContextValue = {
  showToast: (input: ToastInput) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const VARIANT_STYLES: Record<
  ToastVariant,
  { background: string; text: string }
> = {
  success: { background: colors.success, text: colors.textOnPrimary },
  error: { background: colors.error, text: colors.textOnPrimary },
  info: { background: colors.primary, text: colors.textOnPrimary },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const insets = useSafeAreaInsets();
  const [toast, setToast] = useState<{
    message: string;
    variant: ToastVariant;
  } | null>(null);
  const progress = useSharedValue(0);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = () => {
    if (hideTimer.current) {
      clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }
  };

  const hideToast = useCallback(() => {
    progress.value = withTiming(
      0,
      { duration: 200, easing: Easing.in(Easing.cubic) },
      (finished) => {
        if (finished) {
          runOnJS(setToast)(null);
        }
      },
    );
  }, [progress]);

  const showToast = useCallback(
    (input: ToastInput) => {
      clearTimer();
      const variant = input.variant ?? 'success';
      const durationMs = input.durationMs ?? 3200;
      setToast({ message: input.message, variant });
      progress.value = 0;
      progress.value = withTiming(1, {
        duration: 260,
        easing: Easing.out(Easing.cubic),
      });
      hideTimer.current = setTimeout(() => {
        hideToast();
      }, durationMs);
    },
    [hideToast, progress],
  );

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ translateY: (1 - progress.value) * -16 }],
  }));

  const value = useMemo(() => ({ showToast }), [showToast]);
  const palette = toast ? VARIANT_STYLES[toast.variant] : VARIANT_STYLES.info;

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toast ? (
        <View
          pointerEvents="box-none"
          style={[styles.host, { paddingTop: insets.top + space[2] }]}
        >
          <Animated.View style={[styles.toast, animatedStyle]}>
            <Pressable
              onPress={hideToast}
              style={[styles.banner, { backgroundColor: palette.background }]}
              accessibilityRole="alert"
            >
              <Typography variant="body" color={palette.text}>
                {toast.message}
              </Typography>
            </Pressable>
          </Animated.View>
        </View>
      ) : null}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast deve ser usado dentro de ToastProvider.');
  }
  return ctx;
}

const styles = StyleSheet.create({
  host: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    paddingHorizontal: space[4],
  },
  toast: {
    width: '100%',
  },
  banner: {
    borderRadius: radius.md,
    paddingHorizontal: space[4],
    paddingVertical: space[3],
  },
});
