export const colors = {
  // Main backgrounds
  background: '#221A2E',
  surface: '#27213A',
  surfaceLight: '#352D47',

  // Accent colors
  accent: '#511EE3',
  accentLight: '#7B4FFF',
  accentDark: '#3D16AA',

  // Text colors
  textPrimary: '#F5EFFF',
  textSecondary: '#B8B5BF',
  textTertiary: '#8A888F',

  // Status colors
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',

  // Interactive states
  disabled: '#4A4458',
  border: '#3D3551',
  borderSubtle: '#433959',

  // Special
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
} as const;

export type ColorKey = keyof typeof colors;
