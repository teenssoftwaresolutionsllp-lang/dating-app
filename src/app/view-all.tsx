import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';
import { formatApiImageUrl } from '@/services/api';
import {
  getPeopleCategories,
  type CategoryUser,
  type PeopleCategoriesResponse,
} from '@/services/matchApi';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface SectionImageItem {
  id: string;
  name: string;
  age: number | null;
  image: string | null;
  subtitle?: string;
  badgeText?: string;
  badgeType?: 'active' | 'distance' | 'match' | 'interest';
}

export default function ViewAllScreen() {
  const params = useLocalSearchParams<{ sectionId?: string; title?: string }>();
  const sectionId = params.sectionId || 'active';
  const title = params.title || 'All Images';

  const [selectedImage, setSelectedImage] = useState<SectionImageItem | null>(null);
  const [items, setItems] = useState<SectionImageItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  React.useEffect(() => {
    let isMounted = true;
    const sectionKeys: Record<string, keyof PeopleCategoriesResponse> = {
      active: 'active',
      near_you: 'nearYou',
      you_may_like: 'youMayLike',
      similar_interest: 'similarInterest',
      same_religion: 'sameReligion',
      recently_active: 'recentlyActive',
    };

    void getPeopleCategories()
      .then((categories) => {
        if (!isMounted) return;
        const categoryKey = sectionKeys[sectionId] ?? 'active';
        const users = categories?.[categoryKey] ?? [];
        setItems(users.map((user: CategoryUser) => {
          let subtitle: string | undefined;
          let badgeText: string | undefined;
          let badgeType: SectionImageItem['badgeType'];

          if (categoryKey === 'active') {
            subtitle = 'Active now';
            badgeType = 'active';
          } else if (categoryKey === 'nearYou') {
            subtitle = user.city || user.location || undefined;
            badgeText = user.distance || undefined;
            badgeType = 'distance';
          } else if (categoryKey === 'youMayLike') {
            subtitle = user.profession || undefined;
            badgeText = `${user.matchPercentage}% Match`;
            badgeType = 'match';
          } else if (categoryKey === 'similarInterest') {
            subtitle = user.interest || undefined;
            badgeText = subtitle;
            badgeType = 'interest';
          } else if (categoryKey === 'sameReligion') {
            subtitle = user.religion || undefined;
            badgeText = subtitle;
            badgeType = 'interest';
          } else {
            subtitle = user.timeAgo || undefined;
          }

          return {
            id: user.id,
            name: user.name,
            age: user.age,
            image: user.image,
            subtitle,
            badgeText,
            badgeType,
          };
        }));
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [sectionId]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Status Bar */}
        {/* <HeaderStatusBar title="" /> */}

        {/* Custom Header Bar with Back Button */}
        <View style={styles.headerBar}>
          <TouchableOpacity
            style={styles.backButton}
            activeOpacity={0.7}
            onPress={() => router.back()}>
            <Ionicons name="chevron-back-outline" size={24} color="#111827" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>{title}</Text>
            <Text style={styles.headerCount}>
              {isLoading ? 'Loading...' : `${items.length} people`}
            </Text>
          </View>
          <View style={{ width: 40 }} />
        </View>

        {/* Section Images Grid */}
        <ScrollView
          contentContainerStyle={styles.gridContainer}
          showsVerticalScrollIndicator={false}>
          <Text style={styles.gridDesc}>
            {isLoading
              ? 'Loading people...'
              : items.length > 0
                ? <>People matching your preferences in <Text style={styles.boldText}>{title}</Text></>
                : 'No matching people right now'}
          </Text>

          <View style={styles.grid}>
            {items.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.gridCard}
                activeOpacity={0.88}
                onPress={() => setSelectedImage(item)}>
                <View style={styles.imageWrapper}>
                  {item.image ? (
                    <Image
                      source={{ uri: formatApiImageUrl(item.image) }}
                      style={styles.cardImage}
                    />
                  ) : (
                    <View style={[styles.cardImage, styles.imagePlaceholder]}>
                      <Ionicons name="person-outline" size={40} color="#94A3B8" />
                    </View>
                  )}

                  {/* Render Badge based on type */}
                  {item.badgeType === 'active' && (
                    <View style={styles.activePill}>
                      <View style={styles.greenDot} />
                      <Text style={styles.activePillText}>Online</Text>
                    </View>
                  )}

                  {item.badgeType === 'distance' && item.badgeText && (
                    <View style={styles.distanceBadge}>
                      <Text style={styles.distanceBadgeText}>{item.badgeText}</Text>
                    </View>
                  )}

                  {item.badgeType === 'match' && item.badgeText && (
                    <View style={styles.matchBadge}>
                      <Text style={styles.matchBadgeText}>{item.badgeText}</Text>
                    </View>
                  )}
                </View>

                <View style={styles.cardInfo}>
                  <Text style={styles.cardName}>
                    {item.name}{item.age !== null ? `, ${item.age}` : ''}
                  </Text>
                  {item.subtitle && <Text style={styles.cardSubtitle}>{item.subtitle}</Text>}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* Full-Screen Lightbox Modal for Image Inspection */}
        <Modal
          visible={!!selectedImage}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setSelectedImage(null)}>
          {selectedImage && (
            <View style={styles.modalOverlay}>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setSelectedImage(null)}
                activeOpacity={0.8}>
                <Ionicons name="close" size={28} color="#FFFFFF" />
              </TouchableOpacity>

              <View style={styles.modalContent}>
                {selectedImage.image ? (
                  <Image
                    source={{ uri: formatApiImageUrl(selectedImage.image) }}
                    style={styles.fullImage}
                  />
                ) : (
                  <View style={[styles.fullImage, styles.imagePlaceholder]}>
                    <Ionicons name="person-outline" size={64} color="#94A3B8" />
                  </View>
                )}
                <View style={styles.modalFooter}>
                  <Text style={styles.modalName}>
                    {selectedImage.name}{selectedImage.age !== null ? `, ${selectedImage.age}` : ''}
                  </Text>
                  {selectedImage.subtitle && (
                    <Text style={styles.modalSub}>{selectedImage.subtitle}</Text>
                  )}
                </View>
              </View>
            </View>
          )}
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backButton: {
    padding: 8,
  },
  headerTitleContainer: {
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: 'DM_Sans_700Bold',
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  headerCount: {
    fontFamily: 'DM_Sans_400Regular',
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  gridContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
  },
  gridDesc: {
    fontFamily: 'DM_Sans_400Regular',
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 16,
  },
  boldText: {
    fontFamily: 'DM_Sans_700Bold',
    color: '#111827',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  imageWrapper: {
    width: '100%',
    height: 180,
    position: 'relative',
    backgroundColor: '#F1F5F9',
  },
  cardImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E2E8F0',
  },
  activePill: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.65)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  greenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#00E676',
    marginRight: 4,
  },
  activePillText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontFamily: 'DM_Sans_500Medium',
  },
  distanceBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(30, 41, 59, 0.85)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  distanceBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontFamily: 'DM_Sans_500Medium',
  },
  matchBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: '#E91E63',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  matchBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontFamily: 'DM_Sans_700Bold',
  },
  cardInfo: {
    padding: 10,
  },
  cardName: {
    fontFamily: 'DM_Sans_700Bold',
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  cardSubtitle: {
    fontFamily: 'DM_Sans_400Regular',
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  /* Lightbox Modal */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.92)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 8,
    borderRadius: 20,
  },
  modalContent: {
    width: SCREEN_WIDTH * 0.9,
    height: SCREEN_HEIGHT * 0.7,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#1E293B',
  },
  fullImage: {
    width: '100%',
    height: '85%',
    resizeMode: 'cover',
  },
  modalFooter: {
    padding: 16,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
  },
  modalName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: 'DM_Sans_700Bold',
  },
  modalSub: {
    color: '#9CA3AF',
    fontSize: 13,
    fontFamily: 'DM_Sans_400Regular',
    marginTop: 4,
  },
});
