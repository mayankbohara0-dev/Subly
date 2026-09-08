// TrialGuard — Loading Screen with Skeleton Loaders
import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, ViewStyle } from 'react-native';
import { colors } from '../../constants/colors';
import { borderRadius, spacing } from '../../constants/spacing';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 16,
  borderRadius: br = 8,
  style,
}) => {
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.4,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        {
          width: width as any,
          height,
          borderRadius: br,
          backgroundColor: colors.gray300,
          opacity,
        },
        style,
      ]}
    />
  );
};

// Skeleton card for trial list
export const TrialCardSkeleton: React.FC = () => (
  <View style={styles.skeletonCard}>
    <View style={styles.skeletonRow}>
      <Skeleton width={40} height={40} borderRadius={12} />
      <View style={{ flex: 1, marginLeft: spacing.md }}>
        <Skeleton width="60%" height={14} />
        <View style={{ height: spacing.xs }} />
        <Skeleton width="40%" height={11} />
      </View>
      <Skeleton width={60} height={24} borderRadius={12} />
    </View>
    <View style={{ height: spacing.sm }} />
    <Skeleton width="100%" height={8} borderRadius={4} />
  </View>
);

// Full page loading
export const PageLoader: React.FC<{ message?: string }> = ({ message }) => (
  <View style={styles.pageLoader}>
    {[1, 2, 3].map((i) => (
      <TrialCardSkeleton key={i} />
    ))}
  </View>
);

const styles = StyleSheet.create({
  skeletonCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.base,
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  skeletonRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pageLoader: {
    padding: spacing.base,
    flex: 1,
  },
});
