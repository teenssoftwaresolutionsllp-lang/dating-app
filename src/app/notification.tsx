import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SubscriptionIcon } from '@/components/SettingsIcons';

interface NotificationSettingItem {
  id: string;
  title: string;
  subtitle: string;
}

const NOTIFICATION_ITEMS: NotificationSettingItem[] = [
  {
    id: 'push',
    title: 'Push notifications',
    subtitle: 'Enable and Disable',
  },
  {
    id: 'matches',
    title: 'New Matches',
    subtitle: 'When some one likes you',
  },
  {
    id: 'messages',
    title: 'Messages',
    subtitle: 'New messages from your matches',
  },
  {
    id: 'likes',
    title: 'Likes',
    subtitle: 'When some one likes your profile',
  },
  {
    id: 'profileViews',
    title: 'Profile Views',
    subtitle: 'When some one views your profile',
  },
  {
    id: 'reminders',
    title: 'Reminders',
    subtitle: 'Daily reminders to keep you active',
  },
  {
    id: 'promotions',
    title: 'Promotions',
    subtitle: 'Offers and updates from us',
  },
];

export default function NotificationScreen() {
  const router = useRouter();

  // State for each toggle (all enabled by default matching Image 2)
  const [toggleState, setToggleState] = useState<Record<string, boolean>>({
    push: true,
    matches: true,
    messages: true,
    likes: true,
    profileViews: true,
    reminders: true,
    promotions: true,
  });

  const handleToggle = (id: string, value: boolean) => {
    setToggleState((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/settings');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBack}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="chevron-back" size={24} color="#0D7A74" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Notification</Text>
          <View style={styles.headerRightSpacer} />
        </View>

        {/* List of Notification Settings */}
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {NOTIFICATION_ITEMS.map((item) => {
            const isEnabled = !!toggleState[item.id];
            return (
              <View key={item.id} style={styles.cardItem}>
                <View style={styles.cardLeft}>
                  <View style={styles.iconContainer}>
                    <SubscriptionIcon size={24} color="#0D7A74" />
                  </View>
                  <View style={styles.textContainer}>
                    <Text style={styles.itemTitle}>{item.title}</Text>
                    <Text style={styles.itemSubtitle}>{item.subtitle}</Text>
                  </View>
                </View>

                {/* Switch Toggle */}
                <Switch
                  value={isEnabled}
                  onValueChange={(val) => handleToggle(item.id, val)}
                  trackColor={{ false: '#E2E8F0', true: '#0D7A74' }}
                  thumbColor="#FFFFFF"
                  ios_backgroundColor="#E2E8F0"
                />
              </View>
            );
          })}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: 0,
  },
  container: {
    flex: 1,
    backgroundColor: '#FAFCFC',
    maxWidth: 500,
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    padding: 6,
    marginLeft: -6,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'DM_Sans_700Bold',
    color: '#0F172A',
    textAlign: 'center',
  },
  headerRightSpacer: {
    width: 32,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
    gap: 14,
  },
  cardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: '#EFF2F5',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 10,
  },
  iconContainer: {
    width: 34,
    height: 34,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  textContainer: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 15.5,
    fontWeight: '600',
    fontFamily: 'DM_Sans_700Bold',
    color: '#0F172A',
    marginBottom: 2,
  },
  itemSubtitle: {
    fontSize: 12.5,
    fontFamily: 'DM_Sans_400Regular',
    color: '#64748B',
  },
});
