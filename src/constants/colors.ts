// TrialGuard — Color Design System
// Orange + White theme

export const colors = {
  // Primary Brand
  primary: '#FF6B00',
  primaryLight: '#FF8C38',
  primaryDark: '#E55A00',
  primaryBg: '#FFF4ED',
  primaryBgLight: '#FFF9F5',

  // Status Colors
  success: '#16A34A',
  successBg: '#F0FDF4',
  successLight: '#22C55E',

  warning: '#F59E0B',
  warningBg: '#FFFBEB',
  warningLight: '#FCD34D',

  danger: '#DC2626',
  dangerBg: '#FEF2F2',
  dangerLight: '#F87171',

  // Neutrals
  dark: '#111827',
  gray900: '#1F2937',
  gray800: '#374151',
  gray700: '#4B5563',
  gray600: '#6B7280',
  gray500: '#9CA3AF',
  gray400: '#D1D5DB',
  gray300: '#E5E7EB',
  gray200: '#F3F4F6',
  gray100: '#F9FAFB',

  // Base
  white: '#FFFFFF',
  background: '#F8F9FA',
  surface: '#FFFFFF',
  border: '#E5E7EB',
  divider: '#F3F4F6',

  // Text
  textPrimary: '#111827',
  textSecondary: '#4B5563',
  textMuted: '#9CA3AF',
  textInverse: '#FFFFFF',

  // Status specific
  active: '#16A34A',
  expiringSoon: '#F59E0B',
  expired: '#DC2626',
  cancelled: '#16A34A',

  // Shadows (as rgba strings for use in boxShadow/elevation)
  shadowColor: '#000000',
} as const;

export type ColorKey = keyof typeof colors;
