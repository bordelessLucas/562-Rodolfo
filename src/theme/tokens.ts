/**
 * Design tokens provisórios — espelham docs-ia/design_system.md
 * Trocar aqui quando o brand kit oficial chegar.
 */

export const colors = {
  primary: '#1F6B5C',
  primaryPressed: '#18574A',
  secondary: '#5B8A7A',
  background: '#F3F6F4',
  backgroundAccent: '#E4EFEB',
  surface: '#FFFFFF',
  text: '#1A2B26',
  textMuted: '#5C6F68',
  textOnPrimary: '#FFFFFF',
  success: '#2D8A5E',
  warning: '#C4892A',
  error: '#C44B4B',
  border: '#D5E0DB',
  overlay: 'rgba(26, 43, 38, 0.45)',
} as const;

export const fonts = {
  display: 'Literata_600SemiBold',
  displayRegular: 'Literata_400Regular',
  body: 'SourceSans3_400Regular',
  bodyMedium: 'SourceSans3_500Medium',
  bodySemiBold: 'SourceSans3_600SemiBold',
} as const;

export const fontSizes = {
  display: 32,
  h1: 28,
  h2: 22,
  h3: 18,
  body: 16,
  caption: 13,
  label: 14,
} as const;

export const space = {
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  7: 32,
  8: 40,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
} as const;

export const theme = {
  colors,
  fonts,
  fontSizes,
  space,
  radius,
} as const;

export type Theme = typeof theme;
