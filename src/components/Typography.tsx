import React from 'react';
import { StyleSheet, Text, type TextProps, type TextStyle } from 'react-native';

import { colors, fonts, fontSizes } from '@/src/theme';

export type TypographyVariant =
  | 'display'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'body'
  | 'bodyStrong'
  | 'caption'
  | 'label';

export type TypographyProps = TextProps & {
  variant?: TypographyVariant;
  color?: string;
  align?: TextStyle['textAlign'];
};

export function Typography({
  variant = 'body',
  color = colors.text,
  align = 'left',
  style,
  children,
  ...textProps
}: TypographyProps) {
  return (
    <Text
      style={[styles[variant], { color, textAlign: align }, style]}
      {...textProps}
    >
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  display: {
    fontFamily: fonts.display,
    fontSize: fontSizes.display,
    lineHeight: 40,
  },
  h1: {
    fontFamily: fonts.display,
    fontSize: fontSizes.h1,
    lineHeight: 36,
  },
  h2: {
    fontFamily: fonts.display,
    fontSize: fontSizes.h2,
    lineHeight: 30,
  },
  h3: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSizes.h3,
    lineHeight: 26,
  },
  body: {
    fontFamily: fonts.body,
    fontSize: fontSizes.body,
    lineHeight: 24,
  },
  bodyStrong: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSizes.body,
    lineHeight: 24,
  },
  caption: {
    fontFamily: fonts.body,
    fontSize: fontSizes.caption,
    lineHeight: 18,
  },
  label: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSizes.label,
    lineHeight: 20,
  },
});
