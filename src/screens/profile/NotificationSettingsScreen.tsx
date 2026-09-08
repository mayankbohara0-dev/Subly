// TrialGuard — Notification Settings Screen
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  StatusBar,
  Alert,
  Linking,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NotificationPreferences } from '../../types';
import { colors } from '../../constants/colors';
import { typography } from '../../constants/typography';
import { borderRadius, shadow, spacing } from '../../constants/spacing';

interface NotificationSettingsScreenProps {
  prefs: NotificationPreferences;
  onUpdate: (updates: Partial<NotificationPreferences>) => Promise<void>;
  onBack: () => void;
}

const REMINDER_OPTIONS: {
  key: keyof Pick<NotificationPreferences, 'seven_days' | 'three_days' | 'one_day' | 'final_day'>;
  label: string;
  description: string;
}[] = [
  { key: 'seven_days', label: '7 days before', description: 'Early reminder with plenty of time' },
  { key: 'three_days', label: '3 days before', description: 'Warning reminder — time running out' },
  { key: 'one_day', label: '1 day before', description: 'Urgent — last chance reminder' },
  { key: 'final_day', label: 'Final day', description: 'Cancel today to avoid the charge' },
];

export const NotificationSettingsScreen: React.FC<NotificationSettingsScreenProps> = ({
  prefs,
  onUpdate,
  onBack,
}) => {
  const handleToggle = async (
    key: keyof Pick<NotificationPreferences, 'seven_days' | 'three_days' | 'one_day' | 'final_day' | 'notifications_enabled'>,
    value: boolean
  ) => {
    try {
      await onUpdate({ [key]: value });
    } catch {
      Alert.alert('Error', 'Failed to save notification settings.');
    }
  };

  const openAppSettings = () => {
    if (Platform.OS === 'ios') {
      Linking.openURL('app-settings:');
    } else {
      Linking.openSettings();
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={onBack}
          style={styles.backBtn}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.screenTitle}>Notifications</Text>
        <View style={{ width: 80 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Master toggle */}
        <View style={styles.masterCard}>
          <View style={styles.masterInfo}>
            <Text style={styles.masterTitle}>Enable Notifications</Text>
            <Text style={styles.masterDesc}>
              Receive reminders before your trials end
            </Text>
          </View>
          <Switch
            value={prefs.notifications_enabled}
            onValueChange={(val) => handleToggle('notifications_enabled', val)}
            trackColor={{ false: colors.gray300, true: colors.primary }}
            thumbColor={colors.white}
            accessibilityLabel="Enable all notifications"
          />
        </View>

        {!prefs.notifications_enabled && (
          <View style={styles.warningBanner}>
            <Text style={styles.warningText}>
              ⚠️ Notifications are disabled. Subly cannot remind you about upcoming charges.
            </Text>
          </View>
        )}

        {/* Per-reminder toggles */}
        <Text style={styles.sectionLabel}>REMINDER TIMING</Text>
        <View style={[styles.section, !prefs.notifications_enabled && styles.sectionDisabled]}>
          {REMINDER_OPTIONS.map((opt, index) => (
            <View
              key={opt.key}
              style={[
                styles.row,
                index === REMINDER_OPTIONS.length - 1 && styles.lastRow,
              ]}
            >
              <View style={styles.rowInfo}>
                <Text style={styles.rowLabel}>{opt.label}</Text>
                <Text style={styles.rowDesc}>{opt.description}</Text>
              </View>
              <Switch
                value={prefs[opt.key] && prefs.notifications_enabled}
                onValueChange={(val) => handleToggle(opt.key, val)}
                disabled={!prefs.notifications_enabled}
                trackColor={{ false: colors.gray300, true: colors.primary }}
                thumbColor={colors.white}
                accessibilityLabel={opt.label}
              />
            </View>
          ))}
        </View>

        {/* OS settings link */}
        <TouchableOpacity
          style={styles.systemSettingsBtn}
          onPress={openAppSettings}
          accessibilityRole="button"
          accessibilityLabel="Open system notification settings"
        >
          <Text style={styles.systemSettingsText}>
            📱 Open System Notification Settings
          </Text>
        </TouchableOpacity>

        <Text style={styles.footnote}>
          If Subly notifications are blocked at the system level, you'll need to enable them in your device settings.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  backBtn: { width: 80 },
  backText: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.medium,
    color: colors.primary,
  },
  screenTitle: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.bold,
    color: colors.textPrimary,
  },
  content: {
    padding: spacing.base,
    paddingBottom: spacing['4xl'],
  },
  masterCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.primaryBg,
    borderRadius: borderRadius.xl,
    padding: spacing.base,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: '#FFD9B8',
    ...shadow.sm,
  },
  masterInfo: { flex: 1, marginRight: spacing.base },
  masterTitle: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.bold,
    color: colors.primary,
  },
  masterDesc: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.primaryDark,
    marginTop: 2,
    opacity: 0.8,
  },
  warningBanner: {
    backgroundColor: colors.warningBg,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.base,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  warningText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    color: '#92400E',
  },
  sectionLabel: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: spacing.base,
    marginBottom: spacing.xs,
    paddingHorizontal: spacing.xs,
  },
  section: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    ...shadow.sm,
  },
  sectionDisabled: {
    opacity: 0.6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
    minHeight: 60,
  },
  lastRow: {
    borderBottomWidth: 0,
  },
  rowInfo: { flex: 1, marginRight: spacing.base },
  rowLabel: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.textPrimary,
  },
  rowDesc: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.textMuted,
    marginTop: 1,
  },
  systemSettingsBtn: {
    marginTop: spacing.xl,
    padding: spacing.md,
    alignItems: 'center',
  },
  systemSettingsText: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.medium,
    color: colors.primary,
  },
  footnote: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: typography.fontSize.sm * 1.6,
    paddingHorizontal: spacing.md,
    marginTop: spacing.sm,
  },
});
