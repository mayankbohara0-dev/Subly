// TrialGuard — Forgot Password Screen
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
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { colors } from '../../constants/colors';
import { typography } from '../../constants/typography';
import { borderRadius, spacing } from '../../constants/spacing';

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
      <View style={styles.sentContainer}>
        <Text style={styles.sentIcon}>📧</Text>
        <Text style={styles.sentTitle}>Check your inbox</Text>
        <Text style={styles.sentDesc}>
          We've sent a password reset link to{' '}
          <Text style={styles.emailHighlight}>{email}</Text>. Follow the link
          to reset your password.
        </Text>
        <Button
          title="Back to Sign In"
          onPress={onNavigateBack}
          fullWidth
          style={styles.backBtn}
        />
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
        <TouchableOpacity
          onPress={onNavigateBack}
          style={styles.backLink}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Text style={styles.backLinkText}>← Back</Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.lockEmoji}>🔑</Text>
          <Text style={styles.title}>Reset your password</Text>
          <Text style={styles.subtitle}>
            Enter your email address and we'll send you a link to reset your
            password.
          </Text>
        </View>

        <Input
          label="Email"
          value={email}
          onChangeText={(t) => { setEmail(t); setEmailError(undefined); }}
          placeholder="you@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          error={emailError}
          returnKeyType="done"
          onSubmitEditing={handleReset}
          accessibilityLabel="Email address"
        />

        <Button
          title="Send Reset Link"
          onPress={handleReset}
          loading={loading}
          fullWidth
          size="lg"
          style={styles.resetBtn}
        />
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.white },
  container: {
    flex: 1,
    padding: spacing.xl,
    paddingTop: spacing['2xl'],
  },
  backLink: {
    marginBottom: spacing['2xl'],
  },
  backLinkText: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.medium,
    color: colors.primary,
  },
  header: {
    marginBottom: spacing['2xl'],
  },
  lockEmoji: {
    fontSize: 44,
    marginBottom: spacing.base,
  },
  title: {
    fontSize: typography.fontSize['2xl'],
    fontFamily: typography.fontFamily.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
    lineHeight: typography.fontSize.base * 1.6,
  },
  resetBtn: {
    marginTop: spacing.sm,
  },

  // Sent state
  sentContainer: {
    flex: 1,
    backgroundColor: colors.white,
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sentIcon: {
    fontSize: 64,
    marginBottom: spacing.xl,
  },
  sentTitle: {
    fontSize: typography.fontSize['2xl'],
    fontFamily: typography.fontFamily.bold,
    color: colors.textPrimary,
    marginBottom: spacing.base,
    letterSpacing: -0.5,
  },
  sentDesc: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: typography.fontSize.base * 1.6,
    marginBottom: spacing['2xl'],
  },
  emailHighlight: {
    fontFamily: typography.fontFamily.semiBold,
    color: colors.textPrimary,
  },
  backBtn: {
    width: '100%',
  },
});
