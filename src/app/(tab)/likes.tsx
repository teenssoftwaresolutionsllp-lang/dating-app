import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  SafeAreaView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { HeaderStatusBar } from '@/components/HeaderStatusBar';
import { CustomTabBar } from '@/components/CustomTabBar';
import { LIKED_YOU_DATA, YOU_LIKED_DATA } from '@/constants/datingData';

export default function LikesScreen() {
  const [likesSubTab, setLikesSubTab] = useState<'likedYou' | 'youLiked'>('likedYou');

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <HeaderStatusBar title="Likes" />

        {/* Sub Tabs Navigation (Liked You / You Liked) */}
        <View style={styles.likesSubTabBar}>
          <TouchableOpacity
            style={styles.likesSubTabItem}
            onPress={() => setLikesSubTab('likedYou')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.likesSubTabText,
                likesSubTab === 'likedYou' && styles.activeLikesSubTabText,
              ]}
            >
              Liked You
            </Text>
            {likesSubTab === 'likedYou' && <View style={styles.activeUnderline} />}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.likesSubTabItem}
            onPress={() => setLikesSubTab('youLiked')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.likesSubTabText,
                likesSubTab === 'youLiked' && styles.activeLikesSubTabText,
              ]}
            >
              You Liked
            </Text>
            {likesSubTab === 'youLiked' && <View style={styles.activeUnderline} />}
          </TouchableOpacity>
        </View>

        {/* FRESH SEPARATE SECTION RENDERING BASED ON SUB TAB */}
        {likesSubTab === 'likedYou' ? (
          <View key="liked-you-page" style={{ flex: 1 }}>
            <View style={styles.sectionHeaderContainer}>
              <Text style={styles.headerSubtitle}>
                People who liked your profile (Unlock to view)
              </Text>
            </View>
            <ScrollView
              key="scroll-liked-you"
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.grid}>
                {LIKED_YOU_DATA.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.blurredCard}
                    activeOpacity={0.85}
                  >
                    <Image
                      source={item.image}
                      style={styles.blurredCardImage}
                      blurRadius={Platform.OS === 'web' ? 8 : 10}
                      resizeMode="cover"
                    />
                    <View style={styles.blurredCardOverlay} />
                    <View style={styles.lockIconBadge}>
                      <Ionicons name="lock-closed-outline" size={14} color="#FFFFFF" />
                    </View>
                    <Text style={styles.cardNameText}>{item.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        ) : (
          <View key="you-liked-page" style={{ flex: 1 }}>
            <View style={styles.sectionHeaderContainer}>
              <Text style={styles.headerSubtitle}>Profiles you have liked</Text>
            </View>
            <ScrollView
              key="scroll-you-liked"
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.grid}>
                {YOU_LIKED_DATA.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.card}
                    activeOpacity={0.85}
                  >
                    <Image source={item.image} style={styles.cardImg} />
                    <View style={styles.infoBox}>
                      <Text style={styles.name}>{item.name}, {item.age}</Text>
                      <Text style={styles.sub}>{item.location}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        )}

        <CustomTabBar />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  likesSubTabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  likesSubTabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    position: 'relative',
  },
  likesSubTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4B5563',
    fontFamily: 'DM_Sans_500Medium',
  },
  activeLikesSubTabText: {
    color: '#111827',
    fontWeight: '800',
    fontFamily: 'DM_Sans_700Bold',
  },
  activeUnderline: {
    position: 'absolute',
    bottom: -1,
    left: 20,
    right: 20,
    height: 3,
    backgroundColor: '#0F766E',
    borderRadius: 1.5,
  },
  sectionHeaderContainer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 4,
  },
  headerSubtitle: {
    fontFamily: 'DM_Sans_400Regular',
    fontSize: 13,
    color: '#6B7280',
  },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 20, paddingTop: 10 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  blurredCard: {
    width: '48%',
    height: 160,
    borderRadius: 14,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#374151',
  },
  blurredCardImage: {
    width: '100%',
    height: '100%',
  },
  blurredCardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.18)',
  },
  lockIconBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardNameText: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    right: 8,
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'DM_Sans_700Bold',
    fontWeight: '700',
  },
  card: {
    width: '48%',
    height: 160,
    borderRadius: 14,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#F1F5F9',
  },
  cardImg: { width: '100%', height: '100%', resizeMode: 'cover' },
  infoBox: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 8,
  },
  name: { color: '#FFF', fontSize: 13, fontFamily: 'DM_Sans_700Bold' },
  sub: { color: '#CBD5E1', fontSize: 11, fontFamily: 'DM_Sans_400Regular' },
});
