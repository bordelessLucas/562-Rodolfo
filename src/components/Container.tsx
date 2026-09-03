import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, space } from '@/src/theme';

export type ContainerProps = {
  children: React.ReactNode;
  scroll?: boolean;
  keyboardAvoiding?: boolean;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  edges?: ('top' | 'right' | 'bottom' | 'left')[];
};

export function Container({
  children,
  scroll = false,
  keyboardAvoiding = false,
  style,
  contentStyle,
  edges = ['top', 'right', 'bottom', 'left'],
}: ContainerProps) {
  const body = scroll ? (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={[styles.content, contentStyle]}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.content, styles.flex, contentStyle]}>{children}</View>
  );

  const framed = keyboardAvoiding ? (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
    >
      {body}
    </KeyboardAvoidingView>
  ) : (
    body
  );

  return (
    <SafeAreaView edges={edges} style={[styles.safe, style]}>
      {framed}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: space[6],
    paddingVertical: space[5],
  },
});
