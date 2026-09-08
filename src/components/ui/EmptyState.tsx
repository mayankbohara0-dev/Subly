// Subly — Empty State Component with Animated Mascot
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../constants/colors';
import { typography } from '../../constants/typography';
import { spacing } from '../../constants/spacing';
import { Button } from './Button';
import { AnimatedMascot } from './AnimatedMascot';

interface EmptyStateProps {
  icon?: string;
  useMascot?: boolean;
  mascotMood?: 'happy' | 'alert' | 'guarding' | 'celebrating';
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  useMascot = true,
  mascotMood = 'guarding',
  title,
  description,
  actionLabel,
  onAction,
}) => {
  return (
    <View style={styles.container} accessibilityRole="none">
      {useMascot ? (
        <View style={styles.mascotContainer}>
          <AnimatedMascot size={90} mood={mascotMood} interactive={true} />
        </View>
      ) : (
        icon && <Text style={styles.icon}>{icon}</Text>
      )}

      <Text style={styles.title}>{title}</Text>
      {description && <Text style={styles.description}>{description}</Text>}
      {actionLabel && onAction && (
        <Button
          title={actionLabel}
          onPress={onAction}
          style={styles.button}
          size="md"
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing['3xl'],
    flex: 1,
  },
  mascotContainer: {
    marginBottom: spacing.base,
  },
  icon: {
    fontSize: 56,
    marginBottom: spacing.base,
  },
  title: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.bold,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  description: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  button: {
    minWidth: 180,
  },
});
