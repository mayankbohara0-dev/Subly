// Subly — SMS OTP Authentication Screen (Powered by httpSMS & Supabase Auth)
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/ui/Button';
import { colors } from '../../constants/colors';
import { typography } from '../../constants/typography';
import { borderRadius, shadow, spacing } from '../../constants/spacing';
import { AnimatedMascot } from '../../components/ui/AnimatedMascot';

interface LoginScreenProps {
  onNavigateSignUp?: () => void;
  onNavigateForgotPassword?: () => void;
}

type AuthStep = 'phone' | 'otp';

const COUNTRY_CODES = [
  { code: '+91', country: 'IN', flag: '🇮🇳', name: 'India' },
  { code: '+1', country: 'US', flag: '🇺🇸', name: 'USA / Canada' },
  { code: '+44', country: 'GB', flag: '🇬🇧', name: 'UK' },
  { code: '+61', country: 'AU', flag: '🇦🇺', name: 'Australia' },
  { code: '+49', country: 'DE', flag: '🇩🇪', name: 'Germany' },
  { code: '+971', country: 'AE', flag: '🇦🇪', name: 'UAE' },
];

export const LoginScreen: React.FC<LoginScreenProps> = () => {
  const { sendSmsOtp, verifySmsOtp, resendSmsOtp, loading, error, clearError } = useAuth();

  const [step, setStep] = useState<AuthStep>('phone');
  const [selectedCountry, setSelectedCountry] = useState(COUNTRY_CODES[0]);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [otpError, setOtpError] = useState('');
  const [resendTimer, setResendTimer] = useState(0);

  const otpInputRef = useRef<TextInput>(null);

  // Countdown timer for OTP resend
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const fullPhoneNumber = `${selectedCountry.code}${phone.trim().replace(/\D/g, '')}`;

  const validatePhone = (): boolean => {
    const rawDigits = phone.trim().replace(/\D/g, '');
    if (!rawDigits) {
      setPhoneError('Please enter your mobile phone number.');
      return false;
    }
    if (rawDigits.length < 7 || rawDigits.length > 15) {
      setPhoneError('Enter a valid mobile phone number.');
      return false;
    }
    setPhoneError('');
    return true;
  };

  const handleSendCode = async () => {
    clearError();
    if (!validatePhone()) return;

    try {
      await sendSmsOtp(fullPhoneNumber);
      setStep('otp');
      setResendTimer(60);
      setTimeout(() => otpInputRef.current?.focus(), 150);
    } catch {
      // Error handled in useAuth
    }
  };

  const handleVerifyOtp = async () => {
    clearError();
    const cleanOtp = otp.trim();
    if (cleanOtp.length < 6) {
      setOtpError('Please enter the 6-digit verification code.');
      return;
    }
    setOtpError('');

    try {
      await verifySmsOtp(fullPhoneNumber, cleanOtp);
      // Successful login automatically navigates via onAuthStateChange in App.tsx
    } catch {
      // Error handled in useAuth
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    clearError();
    try {
      await resendSmsOtp(fullPhoneNumber);
      setResendTimer(60);
      Alert.alert('Code Sent', `A new 6-digit verification code was sent to ${fullPhoneNumber}.`);
    } catch {
      // Error handled in useAuth
    }
  };

  const formatDisplayPhone = (text: string) => {
    // Format digits nicely: e.g. 98765 43210
    const digits = text.replace(/\D/g, '').slice(0, 12);
    if (digits.length <= 5) return digits;
    return `${digits.slice(0, 5)} ${digits.slice(5)}`;
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Animated Mascot Header */}
        <View style={styles.mascotSection}>
          <AnimatedMascot
            size={96}
            mood={step === 'otp' ? 'celebrating' : 'happy'}
            bubbleText={
              step === 'otp'
                ? 'Check your SMS! ✉️'
                : 'Enter your phone number 📱'
            }
            interactive={true}
          />
          <Text style={styles.appName}>Subly</Text>
          <Text style={styles.subtitle}>
            {step === 'phone'
              ? 'Sign in or register with free SMS OTP'
              : `Enter the 6-digit code sent to ${fullPhoneNumber}`}
          </Text>
        </View>

        {/* Card Container */}
        <View style={styles.card}>
          {error && (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle" size={18} color={colors.danger} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {step === 'phone' ? (
            /* ── STEP 1: PHONE NUMBER ───────────────────────── */
            <>
              <Text style={styles.inputLabel}>MOBILE PHONE NUMBER</Text>
              <View style={[styles.phoneRow, !!phoneError && styles.inputErrorBorder]}>
                {/* Country Code Picker Pill */}
                <TouchableOpacity
                  style={styles.countryPicker}
                  onPress={() => {
                    // Cycle through supported countries
                    const currentIndex = COUNTRY_CODES.findIndex(
                      (c) => c.code === selectedCountry.code
                    );
                    const next = COUNTRY_CODES[(currentIndex + 1) % COUNTRY_CODES.length];
                    setSelectedCountry(next);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.countryFlag}>{selectedCountry.flag}</Text>
                  <Text style={styles.countryCodeText}>{selectedCountry.code}</Text>
                  <Ionicons name="chevron-down" size={12} color={colors.gray500} />
                </TouchableOpacity>

                {/* Phone Input */}
                <TextInput
                  style={styles.phoneInput}
                  value={formatDisplayPhone(phone)}
                  onChangeText={(t) => {
                    setPhone(t);
                    setPhoneError('');
                    clearError();
                  }}
                  placeholder="98765 43210"
                  placeholderTextColor={colors.gray400}
                  keyboardType="phone-pad"
                  returnKeyType="done"
                  onSubmitEditing={handleSendCode}
                  maxLength={14}
                  autoFocus={true}
                />
              </View>

              {phoneError ? (
                <Text style={styles.fieldErrorText}>{phoneError}</Text>
              ) : null}

              <Text style={styles.disclaimerText}>
                We will send an SMS with a 6-digit verification code via httpSMS. Standard SMS rates apply.
              </Text>

              <Button
                title="Send Verification Code"
                onPress={handleSendCode}
                loading={loading}
                fullWidth
                size="lg"
                style={styles.actionBtn}
              />
            </>
          ) : (
            /* ── STEP 2: 6-DIGIT OTP VERIFICATION ───────────── */
            <>
              <View style={styles.otpHeaderRow}>
                <Text style={styles.inputLabel}>ENTER 6-DIGIT CODE</Text>
                <TouchableOpacity
                  onPress={() => {
                    setStep('phone');
                    setOtp('');
                    setOtpError('');
                    clearError();
                  }}
                >
                  <Text style={styles.editPhoneLink}>Change Number</Text>
                </TouchableOpacity>
              </View>

              {/* OTP Input Field */}
              <View style={[styles.otpInputContainer, !!otpError && styles.inputErrorBorder]}>
                <TextInput
                  ref={otpInputRef}
                  style={styles.otpInput}
                  value={otp}
                  onChangeText={(t) => {
                    const cleaned = t.replace(/\D/g, '').slice(0, 6);
                    setOtp(cleaned);
                    setOtpError('');
                    clearError();
                    if (cleaned.length === 6) {
                      // Auto-submit when 6 digits are reached
                      setTimeout(() => handleVerifyOtp(), 50);
                    }
                  }}
                  placeholder="• • • • • •"
                  placeholderTextColor={colors.gray400}
                  keyboardType="number-pad"
                  maxLength={6}
                  autoFocus={true}
                />
              </View>

              {otpError ? (
                <Text style={styles.fieldErrorText}>{otpError}</Text>
              ) : null}

              {/* Resend Section */}
              <View style={styles.resendRow}>
                {resendTimer > 0 ? (
                  <Text style={styles.resendTimerText}>
                    Resend code in <Text style={styles.resendTimerBold}>{resendTimer}s</Text>
                  </Text>
                ) : (
                  <TouchableOpacity onPress={handleResend} activeOpacity={0.7}>
                    <Text style={styles.resendActionText}>Didn't get code? Resend SMS</Text>
                  </TouchableOpacity>
                )}
              </View>

              <Button
                title="Verify & Continue"
                onPress={handleVerifyOtp}
                loading={loading}
                disabled={otp.length < 6}
                fullWidth
                size="lg"
                style={styles.actionBtn}
              />
            </>
          )}

          {/* Gateway Provider Badge */}
          <View style={styles.gatewayBadge}>
            <Ionicons name="flash-outline" size={13} color={colors.primary} />
            <Text style={styles.gatewayBadgeText}>
              Powered by free httpSMS gateway & Supabase Auth
            </Text>
          </View>
        </View>

        {/* Security / Privacy Footer */}
        <View style={styles.securityRow}>
          <Ionicons name="shield-checkmark" size={13} color={colors.gray500} />
          <Text style={styles.securityText}>End-to-end encrypted with Row Level Security</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.white },
  container: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing['3xl'],
    minHeight: '100%',
    justifyContent: 'center',
  },
  mascotSection: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  appName: {
    fontSize: typography.fontSize['3xl'],
    fontFamily: typography.fontFamily.bold,
    color: colors.textPrimary,
    letterSpacing: -0.5,
    marginTop: spacing.sm,
  },
  subtitle: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.textMuted,
    marginTop: 4,
    textAlign: 'center',
    paddingHorizontal: spacing.md,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius['2xl'],
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...shadow.sm,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.dangerBg,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.base,
    gap: spacing.xs,
  },
  errorText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.danger,
  },
  inputLabel: {
    fontSize: 11,
    fontFamily: typography.fontFamily.bold,
    color: colors.gray600,
    letterSpacing: 0.8,
    marginBottom: spacing.xs,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: borderRadius.xl,
    backgroundColor: '#F8FAFC',
    overflow: 'hidden',
    height: 52,
    marginBottom: spacing.xs,
  },
  countryPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    height: '100%',
    backgroundColor: '#F1F5F9',
    borderRightWidth: 1,
    borderRightColor: '#E2E8F0',
    gap: 4,
  },
  countryFlag: {
    fontSize: 16,
  },
  countryCodeText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.textPrimary,
    marginLeft: 2,
  },
  phoneInput: {
    flex: 1,
    height: '100%',
    paddingHorizontal: spacing.md,
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.medium,
    color: colors.textPrimary,
  },
  fieldErrorText: {
    fontSize: 12,
    fontFamily: typography.fontFamily.medium,
    color: colors.danger,
    marginTop: 2,
    marginBottom: spacing.xs,
  },
  inputErrorBorder: {
    borderColor: colors.danger,
  },
  disclaimerText: {
    fontSize: 11,
    fontFamily: typography.fontFamily.regular,
    color: colors.textMuted,
    lineHeight: 16,
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  actionBtn: {
    marginTop: spacing.sm,
  },
  otpHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  editPhoneLink: {
    fontSize: 12,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.primary,
  },
  otpInputContainer: {
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: borderRadius.xl,
    backgroundColor: '#F8FAFC',
    height: 58,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: spacing.xs,
  },
  otpInput: {
    fontSize: 26,
    fontFamily: typography.fontFamily.bold,
    color: colors.textPrimary,
    letterSpacing: 14,
    textAlign: 'center',
    width: '100%',
    paddingHorizontal: spacing.md,
  },
  resendRow: {
    alignItems: 'center',
    marginVertical: spacing.md,
  },
  resendTimerText: {
    fontSize: 12,
    fontFamily: typography.fontFamily.regular,
    color: colors.gray500,
  },
  resendTimerBold: {
    fontFamily: typography.fontFamily.bold,
    color: colors.primary,
  },
  resendActionText: {
    fontSize: 12,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.primary,
  },
  gatewayBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    gap: 4,
  },
  gatewayBadgeText: {
    fontSize: 11,
    fontFamily: typography.fontFamily.medium,
    color: colors.gray500,
  },
  securityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xl,
    gap: 4,
  },
  securityText: {
    fontSize: 11,
    fontFamily: typography.fontFamily.regular,
    color: colors.gray500,
  },
});
