// Subly — High-Performance Animated Mascot Component
import React, { useEffect, useRef, useState, useMemo } from 'react';
import {
  View,
  Image,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Text,
  ViewStyle,
} from 'react-native';
import { colors } from '../../constants/colors';
import { typography } from '../../constants/typography';
import { borderRadius, shadow, spacing } from '../../constants/spacing';

const MASCOT_IMAGE = require('../../../assets/mascot-avatar.png');

interface AnimatedMascotProps {
  size?: number;
  mood?: 'happy' | 'alert' | 'guarding' | 'celebrating';
  interactive?: boolean;
  bubbleText?: string;
  showShadow?: boolean;
  style?: ViewStyle;
}

const FUN_PHRASES = [
  "I'm keeping watch! 🛡️",
  "Never pay by surprise! 💰",
  "Trials under control! 👍",
  "Subly's on duty! 🚀",
  "Saving you money! 🎉",
];

const AnimatedMascotComponent: React.FC<AnimatedMascotProps> = ({
  size = 84,
  mood = 'happy',
  interactive = true,
  bubbleText,
  showShadow = true,
  style,
}) => {
  const [currentBubble, setCurrentBubble] = useState<string | null>(bubbleText ?? null);
  const [showBubble, setShowBubble] = useState<boolean>(!!bubbleText);

  // Single hardware-accelerated animated driver
  const floatAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const bubbleOpacity = useRef(new Animated.Value(bubbleText ? 1 : 0)).current;

  // Derive tilt & shadow scale from floatAnim for 60fps zero-overhead animation
  const rotateInterpolation = useMemo(() => {
    return floatAnim.interpolate({
      inputRange: [-6, 0],
      outputRange: ['2.5deg', '-2.5deg'],
    });
  }, [floatAnim]);

  const shadowScale = useMemo(() => {
    return floatAnim.interpolate({
      inputRange: [-6, 0],
      outputRange: [0.84, 1.05],
    });
  }, [floatAnim]);

  // Single native-driven loop
  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -6,
          duration: 1600,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 1600,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();

    return () => animation.stop();
  }, [floatAnim]);

  // Interactive tap bounce
  const handlePress = () => {
    if (!interactive) return;

    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1.15,
        tension: 200,
        friction: 5,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 140,
        friction: 6,
        useNativeDriver: true,
      }),
    ]).start();

    if (!bubbleText) {
      const randomPhrase = FUN_PHRASES[Math.floor(Math.random() * FUN_PHRASES.length)];
      setCurrentBubble(randomPhrase);
      setShowBubble(true);

      Animated.sequence([
        Animated.timing(bubbleOpacity, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.delay(2000),
        Animated.timing(bubbleOpacity, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setShowBubble(false);
      });
    }
  };

  return (
    <View style={[styles.container, style]}>
      {/* Speech Bubble */}
      {showBubble && currentBubble && (
        <Animated.View style={[styles.speechBubble, { opacity: bubbleOpacity }]}>
          <Text style={styles.speechText}>{currentBubble}</Text>
          <View style={styles.speechTriangle} />
        </Animated.View>
      )}

      {/* Mascot Wrapper */}
      <TouchableOpacity
        activeOpacity={interactive ? 0.88 : 1}
        onPress={interactive ? handlePress : undefined}
        disabled={!interactive}
        style={styles.touchable}
      >
        <Animated.View
          style={[
            styles.mascotWrapper,
            {
              width: size,
              height: size,
              transform: [
                { translateY: floatAnim },
                { rotate: rotateInterpolation },
                { scale: scaleAnim },
              ],
            },
          ]}
        >
          <Image
            source={MASCOT_IMAGE}
            style={{ width: size, height: size }}
            resizeMode="contain"
          />

          {/* Contextual Mood Badge */}
          {mood === 'guarding' && (
            <View style={styles.moodBadge}>
              <Text style={styles.moodBadgeText}>🛡️</Text>
            </View>
          )}
          {mood === 'alert' && (
            <View style={[styles.moodBadge, { backgroundColor: colors.dangerBg }]}>
              <Text style={styles.moodBadgeText}>🔥</Text>
            </View>
          )}
          {mood === 'celebrating' && (
            <View style={[styles.moodBadge, { backgroundColor: '#FEF3C7' }]}>
              <Text style={styles.moodBadgeText}>🎉</Text>
            </View>
          )}
        </Animated.View>

        {/* Dynamic Floor Shadow */}
        {showShadow && (
          <Animated.View
            style={[
              styles.shadowPill,
              {
                width: size * 0.62,
                height: Math.max(5, size * 0.08),
                transform: [{ scaleX: shadowScale }],
              },
            ]}
          />
        )}
      </TouchableOpacity>
    </View>
  );
};

export const AnimatedMascot = React.memo(AnimatedMascotComponent);

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  touchable: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  mascotWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  moodBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primaryBg,
    borderWidth: 2,
    borderColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.sm,
  },
  moodBadgeText: {
    fontSize: 12,
  },
  shadowPill: {
    backgroundColor: 'rgba(15, 23, 42, 0.1)',
    borderRadius: borderRadius.full,
    marginTop: 4,
  },
  speechBubble: {
    position: 'absolute',
    top: -36,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 3,
    zIndex: 20,
    alignItems: 'center',
  },
  speechText: {
    fontSize: 11,
    fontFamily: typography.fontFamily.bold,
    color: colors.textPrimary,
  },
  speechTriangle: {
    position: 'absolute',
    bottom: -5,
    width: 0,
    height: 0,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderTopWidth: 5,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: colors.white,
  },
});
