// TrialGuard — App Navigator (Bottom Tabs + Home Stack)
import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { Trial, TrialFormData, NotificationPreferences, Profile } from '../types';
import { colors } from '../constants/colors';
import { typography } from '../constants/typography';
import { spacing, borderRadius, shadow } from '../constants/spacing';

// Screens
import { HomeScreen } from '../screens/home/HomeScreen';
import { TrialDetailsScreen } from '../screens/home/TrialDetailsScreen';
import { AddTrialScreen } from '../screens/home/AddTrialScreen';
import { TrialsScreen } from '../screens/trials/TrialsScreen';
import { HistoryScreen } from '../screens/history/HistoryScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { NotificationSettingsScreen } from '../screens/profile/NotificationSettingsScreen';

// Hooks
import { useTrials } from '../hooks/useTrials';
import { useNotificationPreferences } from '../hooks/useNotifications';

export type AppTabParamList = {
  HomeTab: undefined;
  TrialsTab: undefined;
  HistoryTab: undefined;
  ProfileTab: undefined;
};

const Tab = createBottomTabNavigator<AppTabParamList>();
const HomeStack = createStackNavigator();
const ProfileStack = createStackNavigator();

// ── Home Stack ────────────────────────────────────────
interface HomeStackNavigatorProps {
  trials: Trial[];
  loading: boolean;
  refreshing: boolean;
  userName?: string;
  prefs: NotificationPreferences;
  userId: string;
  onRefresh: () => Promise<void>;
  onAddTrial: (data: TrialFormData) => Promise<Trial>;
  onEditTrial: (id: string, data: TrialFormData) => Promise<Trial>;
  onCancelTrial: (id: string) => Promise<Trial>;
  onDeleteTrial: (id: string) => Promise<void>;
}

const HomeStackNavigator: React.FC<HomeStackNavigatorProps> = ({
  trials, loading, refreshing, userName, prefs,
  onRefresh, onAddTrial, onEditTrial, onCancelTrial, onDeleteTrial,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTrial, setEditingTrial] = useState<Trial | null>(null);

  return (
    <>
      <HomeStack.Navigator screenOptions={{ headerShown: false }}>
        <HomeStack.Screen name="Home">
          {({ navigation }) => (
            <HomeScreen
              trials={trials}
              loading={loading}
              refreshing={refreshing}
              userName={userName}
              onRefresh={onRefresh}
              onAddTrial={() => setShowAddModal(true)}
              onViewTrial={(trial) =>
                navigation.navigate('TrialDetails', { trialId: trial.id })
              }
            />
          )}
        </HomeStack.Screen>

        <HomeStack.Screen name="TrialDetails">
          {({ navigation, route }) => {
            const { trialId } = (route.params as any) ?? {};
            const trial = trials.find((t) => t.id === trialId);
            if (!trial) return null;
            return (
              <TrialDetailsScreen
                trial={trial}
                onBack={() => navigation.goBack()}
                onEdit={() => { setEditingTrial(trial); navigation.goBack(); }}
                onDelete={async () => {
                  await onDeleteTrial(trial.id);
                  navigation.goBack();
                }}
                onMarkCancelled={async () => {
                  await onCancelTrial(trial.id);
                }}
              />
            );
          }}
        </HomeStack.Screen>
      </HomeStack.Navigator>

      {/* Add Trial Modal */}
      <Modal visible={showAddModal} animationType="slide" presentationStyle="pageSheet">
        <AddTrialScreen
          onSave={async (data) => {
            await onAddTrial(data);
            setShowAddModal(false);
          }}
          onCancel={() => setShowAddModal(false)}
        />
      </Modal>

      {/* Edit Trial Modal */}
      <Modal visible={!!editingTrial} animationType="slide" presentationStyle="pageSheet">
        {editingTrial && (
          <AddTrialScreen
            existingTrial={editingTrial}
            onSave={async (data) => {
              await onEditTrial(editingTrial.id, data);
              setEditingTrial(null);
            }}
            onCancel={() => setEditingTrial(null)}
          />
        )}
      </Modal>
    </>
  );
};

// ── Profile Stack ──────────────────────────────────────
interface ProfileStackNavigatorProps {
  profile: Profile | null;
  prefs: NotificationPreferences;
  onUpdatePrefs: (updates: Partial<NotificationPreferences>) => Promise<void>;
  onSignOut: () => Promise<void>;
}

const ProfileStackNavigator: React.FC<ProfileStackNavigatorProps> = ({
  profile, prefs, onUpdatePrefs, onSignOut,
}) => {
  return (
    <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
      <ProfileStack.Screen name="Profile">
        {({ navigation }) => (
          <ProfileScreen
            profile={profile}
            prefs={prefs}
            onUpdatePrefs={onUpdatePrefs}
            onSignOut={onSignOut}
            onNavigateNotifications={() => navigation.navigate('NotificationSettings')}
          />
        )}
      </ProfileStack.Screen>
      <ProfileStack.Screen name="NotificationSettings">
        {({ navigation }) => (
          <NotificationSettingsScreen
            prefs={prefs}
            onUpdate={onUpdatePrefs}
            onBack={() => navigation.goBack()}
          />
        )}
      </ProfileStack.Screen>
    </ProfileStack.Navigator>
  );
};

// ── Main App Navigator ─────────────────────────────────
interface AppNavigatorProps {
  userId: string;
  profile: Profile | null;
  onSignOut: () => Promise<void>;
}

export const AppNavigator: React.FC<AppNavigatorProps> = ({
  userId,
  profile,
  onSignOut,
}) => {
  const {
    trials,
    loading,
    refreshing,
    refresh,
    addTrial,
    editTrial,
    cancelTrial,
    removeTrial,
  } = useTrials(userId);

  const {
    prefs,
    updatePrefs,
  } = useNotificationPreferences(userId);

  // Modals for Trials + History tabs
  const [showAddFromTrials, setShowAddFromTrials] = useState(false);
  const [selectedTrial, setSelectedTrial] = useState<Trial | null>(null);
  const [editingFromHistory, setEditingFromHistory] = useState<Trial | null>(null);

  const handleAddTrial = useCallback(
    async (data: TrialFormData) => addTrial(data, prefs),
    [addTrial, prefs]
  );

  const handleEditTrial = useCallback(
    async (id: string, data: TrialFormData) => editTrial(id, data, prefs),
    [editTrial, prefs]
  );

  return (
    <>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: true,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.gray500,
          tabBarStyle: styles.tabBar,
          tabBarLabelStyle: styles.tabBarLabel,
          tabBarItemStyle: styles.tabBarItem,
        }}
      >
        <Tab.Screen
          name="HomeTab"
          options={{
            tabBarLabel: 'Home',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? 'home' : 'home-outline'}
                size={22}
                color={color}
              />
            ),
          }}
        >
          {() => (
            <HomeStackNavigator
              trials={trials}
              loading={loading}
              refreshing={refreshing}
              userName={profile?.name}
              prefs={prefs}
              userId={userId}
              onRefresh={refresh}
              onAddTrial={handleAddTrial}
              onEditTrial={handleEditTrial}
              onCancelTrial={cancelTrial}
              onDeleteTrial={removeTrial}
            />
          )}
        </Tab.Screen>

        <Tab.Screen
          name="TrialsTab"
          options={{
            tabBarLabel: 'Trials',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? 'shield-checkmark' : 'shield-checkmark-outline'}
                size={22}
                color={color}
              />
            ),
          }}
        >
          {() => (
            <>
              <TrialsScreen
                trials={trials}
                loading={loading}
                onAddTrial={() => setShowAddFromTrials(true)}
                onViewTrial={(t) => setSelectedTrial(t)}
              />
              <Modal
                visible={showAddFromTrials}
                animationType="slide"
                presentationStyle="pageSheet"
              >
                <AddTrialScreen
                  onSave={async (data) => {
                    await handleAddTrial(data);
                    setShowAddFromTrials(false);
                  }}
                  onCancel={() => setShowAddFromTrials(false)}
                />
              </Modal>
              <Modal
                visible={!!selectedTrial}
                animationType="slide"
                presentationStyle="pageSheet"
              >
                {selectedTrial && (
                  <TrialDetailsScreen
                    trial={
                      trials.find((t) => t.id === selectedTrial.id) ?? selectedTrial
                    }
                    onBack={() => setSelectedTrial(null)}
                    onEdit={() => {
                      setEditingFromHistory(selectedTrial);
                      setSelectedTrial(null);
                    }}
                    onDelete={async () => {
                      await removeTrial(selectedTrial.id);
                      setSelectedTrial(null);
                    }}
                    onMarkCancelled={async () => {
                      const updated = await cancelTrial(selectedTrial.id);
                      setSelectedTrial(updated);
                    }}
                  />
                )}
              </Modal>
              <Modal
                visible={!!editingFromHistory}
                animationType="slide"
                presentationStyle="pageSheet"
              >
                {editingFromHistory && (
                  <AddTrialScreen
                    existingTrial={editingFromHistory}
                    onSave={async (data) => {
                      await handleEditTrial(editingFromHistory.id, data);
                      setEditingFromHistory(null);
                    }}
                    onCancel={() => setEditingFromHistory(null)}
                  />
                )}
              </Modal>
            </>
          )}
        </Tab.Screen>

        <Tab.Screen
          name="HistoryTab"
          options={{
            tabBarLabel: 'History',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? 'time' : 'time-outline'}
                size={22}
                color={color}
              />
            ),
          }}
        >
          {() => {
            const [selectedHistory, setSelectedHistory] = useState<Trial | null>(null);
            return (
              <>
                <HistoryScreen
                  trials={trials}
                  loading={loading}
                  onViewTrial={(t) => setSelectedHistory(t)}
                />
                <Modal
                  visible={!!selectedHistory}
                  animationType="slide"
                  presentationStyle="pageSheet"
                >
                  {selectedHistory && (
                    <TrialDetailsScreen
                      trial={
                        trials.find((t) => t.id === selectedHistory.id) ?? selectedHistory
                      }
                      onBack={() => setSelectedHistory(null)}
                      onEdit={() => setSelectedHistory(null)}
                      onDelete={async () => {
                        await removeTrial(selectedHistory.id);
                        setSelectedHistory(null);
                      }}
                      onMarkCancelled={async () => {
                        const updated = await cancelTrial(selectedHistory.id);
                        setSelectedHistory(updated);
                      }}
                    />
                  )}
                </Modal>
              </>
            );
          }}
        </Tab.Screen>

        <Tab.Screen
          name="ProfileTab"
          options={{
            tabBarLabel: 'Profile',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? 'person' : 'person-outline'}
                size={22}
                color={color}
              />
            ),
          }}
        >
          {() => (
            <ProfileStackNavigator
              profile={profile}
              prefs={prefs}
              onUpdatePrefs={updatePrefs}
              onSignOut={onSignOut}
            />
          )}
        </Tab.Screen>
      </Tab.Navigator>
    </>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    height: Platform.OS === 'ios' ? 84 : 64,
    paddingBottom: Platform.OS === 'ios' ? 24 : 8,
    paddingTop: 6,
    ...shadow.md,
  },
  tabBarItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBarLabel: {
    fontSize: 11,
    fontFamily: typography.fontFamily.medium,
    fontWeight: '600',
    marginTop: 2,
    letterSpacing: 0.1,
  },
});
