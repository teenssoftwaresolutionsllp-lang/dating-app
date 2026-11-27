import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  StatusBar,
  BackHandler,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import {
  viewerService,
  formatViewerRelativeTime,
  type ProfileViewerItem,
} from '@/services/viewerService';

export default function ProfileViewersScreen() {
  const router = useRouter();
  const [viewers, setViewers] = useState<ProfileViewerItem[]>(() =>
    viewerService.getViewers(),
  );
  const [isLoading, setIsLoading] = useState(true);

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tab)/matches' as any);
    }
  };

  useFocusEffect(
    useCallback(() => {
      let active = true;
      setIsLoading(true);
      void viewerService.markAsSeen();
      void viewerService
        .loadViewers()
        .then((data) => {
          if (active && Array.isArray(data)) {
            setViewers(data);
          }
        })
        .finally(() => {
          if (active) setIsLoading(false);
        });

      const refreshTimer = setInterval(() => {
        if (active) {
          setViewers(viewerService.getViewers());
        }
      }, 30000);

      return () => {
        active = false;
        clearInterval(refreshTimer);
      };
    }, []),
  );

  useEffect(() => {
    const onBackPress = () => {
      handleBack();
      return true;
    };
    const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => sub.remove();
  }, []);

  return (
    <View style={styles.outerContainer}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

        {/* Header Bar */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBack}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile Viewers</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Scrollable Viewers List */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.sectionTitle}>Recent viewers</Text>

          {isLoading && viewers.length === 0 ? (
            <Text style={styles.emptyText}>Loading recent viewers...</Text>
          ) : viewers.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="eye-off-outline" size={40} color="#CBD5E1" />
              <Text style={styles.emptyTitle}>No profile views yet</Text>
              <Text style={styles.emptyText}>
                When someone views your profile, they will appear here with the exact time.
              </Text>
            </View>
          ) : (
            <View style={styles.viewersList}>
              {viewers.map((item) => (
                <View key={item.id} style={styles.viewerCard}>
                  <Image source={item.avatar} style={styles.avatar} resizeMode="cover" />
                  <View style={styles.infoContainer}>
                    <Text style={styles.nameText}>{item.name}</Text>
                    <Text style={styles.subtitleText}>{item.subtitle}</Text>
                  </View>
                  <Text style={styles.timeText}>
                    {formatViewerRelativeTime(item.viewedAt, item.time)}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  safeArea: {
    flex: 1,
    width: '100%',
    maxWidth: 480,
    backgroundColor: '#FFFFFF',
  },
  header: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: 'DM_Sans_700Bold',
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  headerSpacer: {
    width: 36,
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 30,
  },
  sectionTitle: {
    fontFamily: 'DM_Sans_500Medium',
    fontSize: 14.5,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
    gap: 8,
  },
  emptyTitle: {
    fontFamily: 'DM_Sans_700Bold',
    fontSize: 16,
    fontWeight: '700',
    color: '#374151',
    marginTop: 6,
  },
  emptyText: {
    fontFamily: 'DM_Sans_400Regular',
    fontSize: 13.5,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  viewersList: {
    gap: 20,
  },
  viewerCard: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#E5E7EB',
  },
  infoContainer: {
    flex: 1,
    marginLeft: 14,
    justifyContent: 'center',
  },
  nameText: {
    fontFamily: 'DM_Sans_700Bold',
    fontSize: 15.5,
    fontWeight: '700',
    color: '#111827',
  },
  subtitleText: {
    fontFamily: 'DM_Sans_400Regular',
    fontSize: 12.5,
    color: '#4B5563',
    marginTop: 3,
  },
  timeText: {
    fontFamily: 'DM_Sans_400Regular',
    fontSize: 11.5,
    color: '#9CA3AF',
    marginLeft: 8,
  },
});
