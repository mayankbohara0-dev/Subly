// Subly — Trial Card Component (Mobbin-inspired Subscription Card)
import React from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Trial } from '../../types';
import { colors } from '../../constants/colors';
import { typography } from '../../constants/typography';
import { borderRadius, shadow, spacing } from '../../constants/spacing';
import { getDaysRemaining, getCountdownLabel, formatDate, getTrialProgress } from '../../utils/dateUtils';
import { formatCurrency, BILLING_CYCLE_LABELS } from '../../utils/currencyUtils';
import { Badge, statusToBadgeProps } from '../ui/Badge';
import { ServiceIcon } from '../ui/ServiceIcon';

interface TrialCardProps {
  trial: Trial;
  onPress?: () => void;
  style?: ViewStyle;
}

export const TrialCard: React.FC<TrialCardProps> = ({ trial, onPress, style }) => {
  const daysRemaining = getDaysRemaining(trial.trial_end_date);
  const countdownLabel = getCountdownLabel(daysRemaining);
  const progress = getTrialProgress(trial.trial_start_date, trial.trial_end_date);
  const badgeProps = statusToBadgeProps(trial.status);
  const cycleLabel = BILLING_CYCLE_LABELS[trial.billing_cycle] ?? trial.billing_cycle;
  const isCancelled = trial.status === 'CANCELLED';
  const isExpired = trial.status === 'EXPIRED';

  const isUrgent = daysRemaining <= 1 && daysRemaining >= 0 && !isCancelled && !isExpired;
  const isWarning = daysRemaining > 1 && daysRemaining <= 3 && !isCancelled && !isExpired;
  const isSoon = daysRemaining > 3 && daysRemaining <= 7 && !isCancelled && !isExpired;

  // Visual status pill theme
  const getPillTheme = () => {
    if (isCancelled) {
      return { bg: colors.successBg, text: colors.success, icon: 'checkmark-circle' as const };
    }
    if (isExpired) {
      return { bg: colors.dangerBg, text: colors.danger, icon: 'close-circle' as const };
    }
    if (isUrgent) {
      return { bg: colors.dangerBg, text: colors.danger, icon: 'flame' as const };
    }
    if (isWarning) {
      return { bg: colors.warningBg, text: '#B45309', icon: 'time' as const };
    }
    if (isSoon) {
      return { bg: '#FFF7ED', text: colors.primary, icon: 'alarm-outline' as const };
    }
    return { bg: colors.gray100, text: colors.gray700, icon: 'calendar-outline' as const };
  };

  const pill = getPillTheme();

  const progressBarColor = isUrgent
    ? colors.danger
    : isWarning
    ? colors.warning
    : isSoon
    ? colors.primary
    : colors.success;

  return (
    <TouchableOpacity
      style={[styles.card, isUrgent && styles.cardUrgent, style]}
      onPress={onPress}
      activeOpacity={0.88}
      accessibilityRole="button"
      accessibilityLabel={`${trial.service_name} trial. ${countdownLabel}. Charge: ${formatCurrency(trial.charge_amount, trial.currency)}.`}
    >
      {/* Top Row: Icon, Service Name, Billing Cycle & Urgency Pill */}
      <View style={styles.header}>
        <View style={styles.iconWrapper}>
          <ServiceIcon serviceName={trial.service_name} size={44} />
        </View>
        <View style={styles.info}>
          <View style={styles.nameRow}>
            <Text style={styles.serviceName} numberOfLines={1}>
              {trial.service_name}
            </Text>
          </View>
          <View style={styles.cycleBadge}>
            <Text style={styles.cycleText}>{cycleLabel}</Text>
          </View>
        </View>

        {/* Dynamic Urgency Pill */}
        <View style={[styles.urgencyPill, { backgroundColor: pill.bg }]}>
          <Ionicons name={pill.icon} size={13} color={pill.text} />
          <Text style={[styles.urgencyPillText, { color: pill.text }]}>
            {isCancelled ? 'Cancelled' : isExpired ? 'Expired' : countdownLabel}
          </Text>
        </View>
      </View>

      {/* Progress Bar (Only for active trials) */}
      {!isCancelled && !isExpired && (
        <View style={styles.progressSection}>
          <View style={styles.progressBarTrack}>
            <View
              style={[
                styles.progressBarFill,
                {
                  width: `${Math.min(100, Math.max(5, progress * 100))}%` as any,
                  backgroundColor: progressBarColor,
                },
              ]}
            />
          </View>
        </View>
      )}

      {/* Footer Row: Price & Renewal Date */}
      <View style={styles.footer}>
        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>Next Charge</Text>
          <Text style={styles.priceValue}>
            {formatCurrency(trial.charge_amount, trial.currency)}
            <Text style={styles.priceCycle}>/{cycleLabel.toLowerCase()}</Text>
          </Text>
        </View>

        <View style={styles.footerDivider} />

        <View style={styles.dateContainer}>
          <Text style={styles.dateLabel}>
            {isCancelled ? 'Cancelled Date' : 'Auto-Renews'}
          </Text>
          <View style={styles.dateRow}>
            <Ionicons
              name={isCancelled ? 'shield-checkmark-outline' : 'calendar-outline'}
              size={13}
              color={colors.gray500}
            />
            <Text style={styles.dateValue}>
              {isCancelled && trial.cancelled_at
                ? formatDate(trial.cancelled_at.split('T')[0])
                : formatDate(trial.trial_end_date)}
            </Text>
          </View>
        </View>
      </View>

      {/* Alert banner for today/tomorrow */}
      {isUrgent && (
        <View style={styles.urgentBanner}>
          <Ionicons name="alert-circle" size={14} color={colors.danger} />
          <Text style={styles.urgentBannerText}>
            Action required! Cancel today to avoid being charged.
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.base,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  cardUrgent: {
    borderColor: '#FCA5A5',
    backgroundColor: '#FEFAF8',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  iconWrapper: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  info: {
    flex: 1,
    marginLeft: spacing.md,
    marginRight: spacing.xs,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  serviceName: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.bold,
    color: colors.textPrimary,
    letterSpacing: -0.2,
  },
  cycleBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.gray100,
    borderRadius: borderRadius.sm,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginTop: 3,
  },
  cycleText: {
    fontSize: 10,
    fontFamily: typography.fontFamily.medium,
    color: colors.gray600,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  urgencyPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    gap: 4,
  },
  urgencyPillText: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.semiBold,
  },
  progressSection: {
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  progressBarTrack: {
    height: 4,
    backgroundColor: colors.gray200,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: spacing.sm,
    marginTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  priceContainer: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 10,
    fontFamily: typography.fontFamily.medium,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 2,
  },
  priceValue: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.bold,
    color: colors.textPrimary,
  },
  priceCycle: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.regular,
    color: colors.textMuted,
  },
  footerDivider: {
    width: 1,
    height: 28,
    backgroundColor: '#F1F5F9',
    marginHorizontal: spacing.md,
  },
  dateContainer: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 10,
    fontFamily: typography.fontFamily.medium,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 2,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateValue: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.gray800,
  },
  urgentBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.dangerBg,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    marginTop: spacing.sm,
    gap: 6,
  },
  urgentBannerText: {
    fontSize: 11,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.danger,
    flex: 1,
  },
});
