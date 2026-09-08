// TrialGuard — Badge / Status Indicator Component
import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '../../constants/colors';
import { typography } from '../../constants/typography';
import { borderRadius, spacing } from '../../constants/spacing';
import { TrialStatus } from '../../types';

interface BadgeProps {
  label: string;
  variant?: 'active' | 'expiringSoon' | 'expired' | 'cancelled' | 'neutral';
  style?: ViewStyle;
}

export const Badge: React.FC<BadgeProps> = ({ label, variant = 'neutral', style }) => {
  return (
    <View style={[styles.badge, styles[variant], style]}>
      <View style={[styles.dot, styles[`dot_${variant}`]]} />
      <Text style={[styles.label, styles[`label_${variant}`]]}>{label}</Text>
    </View>
  );
};

/**
 * Maps a TrialStatus to a Badge variant and label.
 */
export function statusToBadgeProps(status: TrialStatus): { label: string; variant: BadgeProps['variant'] } {
  switch (status) {
    case 'ACTIVE':
      return { label: 'Active', variant: 'active' };
    case 'EXPIRING_SOON':
      return { label: 'Expiring Soon', variant: 'expiringSoon' };
    case 'EXPIRED':
      return { label: 'Expired', variant: 'expired' };
    case 'CANCELLED':
      return { label: 'Cancelled', variant: 'cancelled' };
    default:
      return { label: status, variant: 'neutral' };
  }
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
    gap: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  label: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.semiBold,
    letterSpacing: typography.letterSpacing.wide,
    textTransform: 'uppercase',
  },

  // Variants
  active: { backgroundColor: colors.successBg },
  expiringSoon: { backgroundColor: '#FFF8E6' },
  expired: { backgroundColor: colors.dangerBg },
  cancelled: { backgroundColor: colors.successBg },
  neutral: { backgroundColor: colors.gray200 },

  dot_active: { backgroundColor: colors.success },
  dot_expiringSoon: { backgroundColor: '#F59E0B' },
  dot_expired: { backgroundColor: colors.danger },
  dot_cancelled: { backgroundColor: colors.success },
  dot_neutral: { backgroundColor: colors.gray500 },

  label_active: { color: colors.success },
  label_expiringSoon: { color: '#B45309' },
  label_expired: { color: colors.danger },
  label_cancelled: { color: colors.success },
  label_neutral: { color: colors.gray600 },
});
