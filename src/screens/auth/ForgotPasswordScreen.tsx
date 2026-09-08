// Subly — Forgot Password Screen with Animated Mascot
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { colors } from '../../constants/colors';
import { typography } from '../../constants/typography';
import { borderRadius, shadow, spacing } from '../../constants/spacing';
import { AnimatedMascot } from '../../components/ui/AnimatedMascot';

interface ForgotPasswordScreenProps {
  onNavigateBack: () => void;
}

export const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({
  onNavigateBack,
}) => {
  const { resetPassword, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string>();
  const [sent, setSent] = useState(false);

  const handleReset = async () => {
    if (!email.trim()) {
      setEmailError('Email is required.');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Enter a valid email address.');
      return;
    }
    setEmailError(undefined);

    try {
      await resetPassword(email);
      setSent(true);
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Failed to send reset email.');
    }
  };

  if (sent) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
        <View style={styles.sentContent}>
          <AnimatedMascot
            size={100}
            mood="celebrating"
            bubbleText="Email sent! Check inbox 📩"
            interactive={true}
          />
          <Text style={styles.sentTitle}>Check Your Inbox</Text>
          <Text style={styles.sentDesc}>
            We've sent password reset instructions to{' '}
            <Text style={styles.emailHighlight}>{email}</Text>. Follow the link to create a new password.
          </Text>

          <Button
            title="Back to Sign In"
            onPress={onNavigateBack}
            fullWidth
            size="lg"
            style={styles.backBtn}
          />
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
      <View style={styles.container}>
        {/* Back Link */}
        <TouchableOpacity
          onPress={onNavigateBack}
          style={styles.backLink}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={20} color={colors.textPrimary} />
          <Text style={styles.backLinkText}>Back</Text>
        </TouchableOpacity>

        {/* Mascot Header */}
        <View style={styles.mascotSection}>
          <AnimatedMascot
            size={90}
            mood="happy"
            bubbleText="Forgot your key? 🔑"
            interactive={true}
          />
          <Text style={styles.title}>Reset Password</Text>
          <Text style={styles.subtitle}>
            Enter your email to receive recovery instructions.
          </Text>
        </View>

        {/* Input Card */}
        <View style={styles.card}>
          <Input
            label="ACCOUNT EMAIL"
            value={email}
            onChangeText={(t) => { setEmail(t); setEmailError(undefined); }}
            placeholder="you@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            error={emailError}
            returnKeyType="done"
            onSubmitEditing={handleReset}
            accessibilityLabel="Account email"
          />

          <Button
            title="Send Reset Instructions"
            onPress={handleReset}
            loading={loading}
            fullWidth
            size="lg"
            style={styles.resetBtn}
          />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.white },
  container: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: 60,
    justifyContent: 'center',
  },
  backLink: {
    position: 'absolute',
    top: 50,
    left: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: spacing.xs,
  },
  backLinkText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.textPrimary,
  },
  mascotSection: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: typography.fontSize['2xl'],
    fontFamily: typography.fontFamily.bold,
    color: colors.textPrimary,
    marginTop: spacing.md,
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: spacing.base,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius['2xl'],
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...shadow.sm,
  },
  resetBtn: {
    marginTop: spacing.sm,
  },
  sentContent: {
    alignItems: 'center',
    paddingHorizontal: spacing.base,
  },
  sentTitle: {
    fontSize: typography.fontSize['2xl'],
    fontFamily: typography.fontFamily.bold,
    color: colors.textPrimary,
    marginTop: spacing.lg,
    marginBottom: spacing.xs,
  },
  sentDesc: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.xl,
  },
  emailHighlight: {
    fontFamily: typography.fontFamily.bold,
    color: colors.textPrimary,
  },
  backBtn: {
    width: '100%',
  },
});
