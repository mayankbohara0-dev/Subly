// TrialGuard — Service Icon Component
// Renders emoji icon or first-letter avatar for a service
import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '../../constants/colors';
import { typography } from '../../constants/typography';
import { borderRadius } from '../../constants/spacing';

// Predefined emoji icons for common services
const SERVICE_ICONS: Record<string, string> = {
  spotify: '🎵',
  netflix: '🎬',
  amazon: '📦',
  'amazon prime': '📦',
  canva: '🎨',
  chatgpt: '🤖',
  openai: '🤖',
  adobe: '🖌️',
  figma: '🔷',
  notion: '📝',
  slack: '💬',
  discord: '🎮',
  youtube: '▶️',
  'youtube premium': '▶️',
  apple: '🍎',
  microsoft: '🪟',
  google: '🔍',
  vpn: '🔐',
  dropbox: '📂',
  zoom: '📹',
  linkedin: '💼',
  grammarly: '✍️',
  duolingo: '🦜',
  headspace: '🧘',
};

function getServiceIcon(serviceName: string): string | null {
  const key = serviceName.toLowerCase().trim();
  return SERVICE_ICONS[key] ?? null;
}

function getInitial(serviceName: string): string {
  return (serviceName.trim()[0] ?? '?').toUpperCase();
}

// Deterministic color from service name
const AVATAR_COLORS = [
  '#FF6B00', '#E55A00', '#FF8C38', '#C84B00',
  '#FB923C', '#EA580C', '#F97316', '#DC4E00',
];
function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

interface ServiceIconProps {
  serviceName: string;
  size?: number;
  style?: ViewStyle;
}

export const ServiceIcon: React.FC<ServiceIconProps> = ({
  serviceName,
  size = 44,
  style,
}) => {
  const emoji = getServiceIcon(serviceName);
  const initial = getInitial(serviceName);
  const bg = getAvatarColor(serviceName);

  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size * 0.28,
          backgroundColor: emoji ? colors.gray100 : bg,
        },
        style,
      ]}
    >
      {emoji ? (
        <Text style={{ fontSize: size * 0.5 }}>{emoji}</Text>
      ) : (
        <Text
          style={[
            styles.initial,
            { fontSize: size * 0.42, color: colors.white },
          ]}
        >
          {initial}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initial: {
    fontFamily: typography.fontFamily.bold,
  },
});
