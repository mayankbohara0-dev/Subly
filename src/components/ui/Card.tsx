// TrialGuard — Card Component
import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '../../constants/colors';
import { borderRadius, shadow, spacing } from '../../constants/spacing';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'primary' | 'warning' | 'danger' | 'success';
  noPadding?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  variant = 'default',
  noPadding = false,
}) => {
  return (
    <View
      style={[
        styles.card,
        styles[variant],
        noPadding && styles.noPadding,
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.base,
    ...shadow.md,
  },
  noPadding: {
    padding: 0,
  },
  default: {
    backgroundColor: colors.white,
  },
  primary: {
    backgroundColor: colors.primaryBg,
    borderWidth: 1,
    borderColor: colors.primaryBgLight,
  },
  warning: {
    backgroundColor: '#FFF8F0',
    borderWidth: 1,
    borderColor: '#FFE4C4',
  },
  danger: {
    backgroundColor: colors.dangerBg,
    borderWidth: 1,
    borderColor: '#FCC',
  },
  success: {
    backgroundColor: colors.successBg,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
});
