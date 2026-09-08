// TrialGuard — Root App.tsx
import 'react-native-url-polyfill/auto';
import React, { useState, useEffect, useCallback } from 'react';
import Constants from 'expo-constants';
import { StatusBar, Platform, Alert, View, Text, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';

// Screens
import { SplashScreen } from './src/screens/SplashScreen';
import { OnboardingScreen, isOnboardingDone } from './src/screens/onboarding/OnboardingScreen';
import { AuthNavigator } from './src/navigation/AuthNavigator';
import { AppNavigator } from './src/navigation/AppNavigator';

// Hooks & Services
import { useAuth } from './src/hooks/useAuth';
import {
  requestNotificationPermissions,
  setupNotificationResponseHandler,
} from './src/services/notificationService';
import { analytics } from './src/services/analyticsService';
import { colors } from './src/constants/colors';

type AppFlow = 'splash' | 'onboarding' | 'auth' | 'app';

// ─── Inner component that uses auth hook ─────────────────
const AppInner: React.FC = () => {
  const { session, user, profile, loading, signOut, deleteAccount } = useAuth();
  const [flow, setFlow] = useState<AppFlow>('splash');
  const [splashDone, setSplashDone] = useState(false);

  // Request notification permissions once — wrapped so Expo Go doesn't crash
  useEffect(() => {
    // In Expo Go (SDK 53+), remote push is removed but local scheduling still works.
    // We just silently swallow any permission errors.
    try {
      requestNotificationPermissions().catch(() => {});
    } catch {
      // Expo Go — ignore gracefully
    }
  }, []);

  // Set up notification response handler (deep link)
  useEffect(() => {
    const cleanup = setupNotificationResponseHandler((trialId) => {
      analytics.track('notification_opened', { trialId });
      // Future: navigate to trial details via ref
    });
    return cleanup;
  }, []);

  // Decide flow after splash + auth resolved
  const resolveFlow = useCallback(async () => {
    if (loading || !splashDone) return;
    if (session && user) {
      analytics.track('app_opened');
      setFlow('app');
      return;
    }
    const onboarded = await isOnboardingDone();
    setFlow(onboarded ? 'auth' : 'onboarding');
  }, [loading, splashDone, session, user]);

  useEffect(() => {
    resolveFlow();
  }, [resolveFlow]);

  // Also react to auth state changes while app is open
  useEffect(() => {
    if (flow === 'app' && !loading && !session) {
      setFlow('auth');
    }
  }, [session, loading, flow]);

  const handleSignOut = useCallback(async () => {
    try {
      await signOut();
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Failed to sign out.');
    }
  }, [signOut]);

  // Splash
  if (flow === 'splash' || (!splashDone)) {
    return (
      <SplashScreen
        onFinish={() => {
          setSplashDone(true);
          resolveFlow();
        }}
      />
    );
  }

  // Onboarding
  if (flow === 'onboarding') {
    return <OnboardingScreen onComplete={() => setFlow('auth')} />;
  }

  // Auth
  if (flow === 'auth' || !session || !user) {
    return (
      <NavigationContainer>
        <AuthNavigator />
      </NavigationContainer>
    );
  }

  // Authenticated App
  return (
    <NavigationContainer>
      <AppNavigator
        userId={user.id}
        profile={profile}
        onSignOut={handleSignOut}
        onDeleteAccount={deleteAccount}
      />
    </NavigationContainer>
  );
};

// ─── Root export ──────────────────────────────────────────
export default function App() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  if (!fontsLoaded) {
    // Minimal loading while fonts download
    return (
      <View style={styles.fontLoader}>
        <Text style={styles.fontLoaderText}>Loading...</Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <StatusBar
          barStyle="dark-content"
          backgroundColor={colors.background}
          translucent={false}
        />
        <AppInner />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  fontLoader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
  },
  fontLoaderText: {
    fontSize: 16,
    color: colors.textMuted,
  },
});
