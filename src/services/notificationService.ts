// TrialGuard — Notification Service (Expo Go Compatible)
//
// expo-notifications is NOT installed because Expo Go SDK 53 crashes
// when any code imports it (native module registration error).
//
// This file provides the same API surface with no-op implementations
// so the rest of the app compiles and runs perfectly in Expo Go.
//
// To enable real notifications:
//   1. Run:  npm install expo-notifications
//   2. Run:  npx expo run:android   (development build)
//   3. Uncomment the real implementation below.
//
// ─────────────────────────────────────────────────────────────────────────────

import { Trial, NotificationPreferences } from '../types';

export interface NotificationScheduleResult {
  scheduled: number;
  failed: number;
}

// ─── All functions are no-ops in Expo Go ─────────────────────────────────────

export async function requestNotificationPermissions(): Promise<boolean> {
  // Will be implemented in the development build
  console.log('[Notifications] Skipped — install expo-notifications for a dev build');
  return false;
}

export async function getNotificationPermissionStatus(): Promise<string> {
  return 'unavailable';
}

export async function cancelTrialNotifications(trialId: string): Promise<void> {
  // No-op
}

export async function scheduleTrialReminders(
  trial: Trial,
  prefs: NotificationPreferences
): Promise<NotificationScheduleResult> {
  // No-op — will schedule in development build
  console.log(
    `[Notifications] Reminder scheduling skipped for "${trial.service_name}" (Expo Go)`
  );
  return { scheduled: 0, failed: 0 };
}

export function setupNotificationResponseHandler(
  onTrialNotificationTap: (trialId: string) => void
): () => void {
  // No-op cleanup
  return () => {};
}
