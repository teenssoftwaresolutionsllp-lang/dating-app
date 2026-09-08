import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { router, usePathname } from 'expo-router';

function MatchesTabIcon({ color, size = 22 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
        stroke={color}
        strokeWidth={2}
        fill="none"
      />
      <Path
        d="M7.5 16.5l-0.7-.65C4.3 13.7 2.5 12.1 2.5 10.2c0-1.5 1.2-2.7 2.7-2.7.9 0 1.7.4 2.3 1 0.6-.6 1.4-1 2.3-1 1.5 0 2.7 1.2 2.7 2.7 0 1.9-1.8 3.5-4.3 5.65L7.5 16.5z"
        fill={color}
      />
    </Svg>
  );
}

function LikesTabIcon({ color, size = 22 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M18 10a3 3 0 1 0-3-3H9a3 3 0 1 0-3 3v4a3 3 0 1 0 3 3h6a3 3 0 1 0 3-3v-4zM6 7a1 1 0 1 1 1 1H6V7zm11 0a1 1 0 1 1 1 1h-1V7zM7 17a1 1 0 1 1-1-1h1v1zm11 0a1 1 0 1 1-1 1v-1h1z"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function PeopleTabIcon({ color, size = 22 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="8" r="3.2" fill={color} />
      <Path
        d="M6.5 19c0-3 2.5-5.5 5.5-5.5s5.5 2.5 5.5 5.5"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
      <Circle cx="6" cy="9.5" r="2.2" fill={color} />
      <Path d="M2.5 18.5c0-2.2 1.8-4 4-4" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
      <Circle cx="18" cy="9.5" r="2.2" fill={color} />
      <Path d="M21.5 18.5c0-2.2-1.8-4-4-4" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}

function ChatsTabIcon({ color, size = 22 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M20 12c0-4.42-3.58-8-8-8S4 7.58 4 12c0 1.8.6 3.47 1.63 4.81L4.5 20.5l4.02-1.07C9.77 19.7 10.86 20 12 20c4.42 0 8-3.58 8-8z"
        fill={color}
      />
      <Path d="M8 10.5h8M8 13.5h5" stroke="#FFFFFF" strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}

function MeTabIcon({ color, size = 22 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth={2} />
      <Circle cx="12" cy="9.5" r="3" fill={color} />
      <Path
        d="M6.8 17.2c1.2-2.2 3.2-3.2 5.2-3.2s4 1 5.2 3.2"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export interface TabItem {
  id: string;
  label: string;
  route: string;
  renderIcon: (color: string) => React.ReactNode;
}

const TABS: TabItem[] = [
  { id: 'matches', label: 'Matches', route: '/(tab)/matches', renderIcon: (c) => <MatchesTabIcon color={c} /> },
  { id: 'likes', label: 'Likes', route: '/(tab)/likes', renderIcon: (c) => <LikesTabIcon color={c} /> },
  { id: 'people', label: 'People', route: '/(tab)/people', renderIcon: (c) => <PeopleTabIcon color={c} /> },
  { id: 'chats', label: 'Chats', route: '/(tab)/chats', renderIcon: (c) => <ChatsTabIcon color={c} /> },
  { id: 'me', label: 'Me', route: '/(tab)/me', renderIcon: (c) => <MeTabIcon color={c} /> },
];

export const CustomTabBar: React.FC = () => {
  const pathname = usePathname();

  return (
    <View style={styles.container}>
      {TABS.map((tab) => {
        const isActive =
          pathname === tab.route ||
          (tab.id === 'people' && (pathname === '/(tab)/home' || pathname === '/(tab)')) ||
          pathname.includes(tab.id);

        const color = isActive ? '#0D7A74' : '#78B0A8';

        return (
          <TouchableOpacity
            key={tab.id}
            style={styles.tabButton}
            activeOpacity={0.7}
            onPress={() => {
              if (!isActive) {
                router.push(tab.route as any);
              }
            }}>
            <View style={styles.iconWrapper}>
              {tab.renderIcon(color)}
            </View>
            <Text style={[styles.tabLabel, { color, fontWeight: isActive ? '700' : '500' }]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 24 : 10,
    paddingHorizontal: 8,
    justifyContent: 'space-around',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  iconWrapper: {
    marginBottom: 6,
  },
  tabLabel: {
    fontSize: 11,
    fontFamily: 'DM_Sans_500Medium',
  },
});
