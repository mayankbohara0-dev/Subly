// Subly — Interactive Animated Mascot Component
import React, { useEffect, useRef, useState } from 'react';
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

export const AnimatedMascot: React.FC<AnimatedMascotProps> = ({
  size = 84,
  mood = 'happy',
  interactive = true,
  bubbleText,
  showShadow = true,
  style,
}) => {
  const [currentBubble, setCurrentBubble] = useState<string | null>(bubbleText ?? null);
  const [showBubble, setShowBubble] = useState<boolean>(!!bubbleText);

  // Animated values
  const floatAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const shadowScaleAnim = useRef(new Animated.Value(1)).current;
  const bubbleOpacity = useRef(new Animated.Value(bubbleText ? 1 : 0)).current;

  // Gentle floating & tilt loop
  useEffect(() => {
    const floatLoop = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(floatAnim, {
            toValue: -6,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(rotateAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(shadowScaleAnim, {
            toValue: 0.85,
            duration: 1500,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(floatAnim, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(rotateAnim, {
            toValue: -1,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(shadowScaleAnim, {
            toValue: 1.05,
            duration: 1500,
            useNativeDriver: true,
          }),
        ]),
      ])
    );
    floatLoop.start();

    return () => floatLoop.stop();
  }, [floatAnim, rotateAnim, shadowScaleAnim]);

  // Handle interactive tap
  const handlePress = () => {
    if (!interactive) return;

    // Bounce spring animation
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1.18,
        tension: 180,
        friction: 4,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 120,
        friction: 5,
        useNativeDriver: true,
      }),
    ]).start();

    // Show random fun speech bubble if not static
    if (!bubbleText) {
      const randomPhrase = FUN_PHRASES[Math.floor(Math.random() * FUN_PHRASES.length)];
      setCurrentBubble(randomPhrase);
      setShowBubble(true);

      Animated.sequence([
        Animated.timing(bubbleOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.delay(2200),
        Animated.timing(bubbleOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setShowBubble(false);
      });
    }
  };

  const spin = rotateAnim.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['-3deg', '0deg', '3deg'],
  });

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
        activeOpacity={interactive ? 0.85 : 1}
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
                { rotate: spin },
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
                width: size * 0.65,
                height: Math.max(6, size * 0.1),
                transform: [{ scaleX: shadowScaleAnim }],
              },
            ]}
          />
        )}
      </TouchableOpacity>
    </View>
  );
};

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
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.primaryBg,
    borderWidth: 2,
    borderColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.sm,
  },
  moodBadgeText: {
    fontSize: 13,
  },
  shadowPill: {
    backgroundColor: 'rgba(15, 23, 42, 0.12)',
    borderRadius: borderRadius.full,
    marginTop: 6,
  },
  speechBubble: {
    position: 'absolute',
    top: -38,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    zIndex: 20,
    alignItems: 'center',
  },
  speechText: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.bold,
    color: colors.textPrimary,
  },
  speechTriangle: {
    position: 'absolute',
    bottom: -6,
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: colors.white,
  },
});
