import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { HeaderStatusBar } from "@/components/HeaderStatusBar";
import { CustomTabBar } from "@/components/CustomTabBar";
import { formatApiImageUrl } from "@/services/api";
import {
  getLikesReceived,
  getSentLikes,
  type LikeReceivedItem,
  type SentLikeItem,
} from "@/services/matchApi";

export default function LikesScreen() {
  const [likesSubTab, setLikesSubTab] = useState<"likedYou" | "youLiked">(
    "likedYou",
  );
  const [liveLikesReceived, setLiveLikesReceived] = useState<
    LikeReceivedItem[]
  >([]);
  const [liveSentLikes, setLiveSentLikes] = useState<SentLikeItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let isFocused = true;
      setIsLoading(true);

      Promise.all([getLikesReceived(), getSentLikes()])
        .then(([received, sent]) => {
          if (isFocused) {
            setLiveLikesReceived(received);
            setLiveSentLikes(sent);
          }
        })
        .finally(() => {
          if (isFocused) setIsLoading(false);
        });

      return () => {
        isFocused = false;
      };
    }, [])
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <HeaderStatusBar title="Likes" />

        {/* Sub Tabs Navigation (Liked You / You Liked) */}
        <View style={styles.likesSubTabBar}>
          <TouchableOpacity
            style={styles.likesSubTabItem}
            onPress={() => setLikesSubTab("likedYou")}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.likesSubTabText,
                likesSubTab === "likedYou" && styles.activeLikesSubTabText,
              ]}
            >
              Liked You
            </Text>
            {likesSubTab === "likedYou" && (
              <View style={styles.activeUnderline} />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.likesSubTabItem}
            onPress={() => setLikesSubTab("youLiked")}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.likesSubTabText,
                likesSubTab === "youLiked" && styles.activeLikesSubTabText,
              ]}
            >
              You Liked
            </Text>
            {likesSubTab === "youLiked" && (
              <View style={styles.activeUnderline} />
            )}
          </TouchableOpacity>
        </View>

        {/* FRESH SEPARATE SECTION RENDERING BASED ON SUB TAB */}
        {likesSubTab === "likedYou" ? (
          <View key="liked-you-page" style={{ flex: 1 }}>
            <View style={styles.sectionHeaderContainer}>
              <Text style={styles.headerSubtitle}>
                People who liked your profile
              </Text>
            </View>
            <ScrollView
              key="scroll-liked-you"
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              {isLoading ? (
                <Text style={styles.emptyText}>Loading likes...</Text>
              ) : liveLikesReceived.length === 0 ? (
                <Text style={styles.emptyText}>No likes yet</Text>
              ) : (
                <View style={styles.grid}>
                  {liveLikesReceived.map((item, idx) => {
                    const name = item.user?.name || item.name || "Someone";
                    const age = item.user?.age ?? item.age;
                    const photo = item.user?.primaryPhoto || item.photo;
                    return (
                      <TouchableOpacity
                        key={item.swipeId || item.userId || `like-${idx}`}
                        style={styles.card}
                        activeOpacity={0.85}
                      >
                        {photo ? (
                          <Image
                            source={{ uri: formatApiImageUrl(photo) }}
                            style={styles.cardImg}
                            resizeMode="cover"
                          />
                        ) : (
                          <View
                            style={[
                              styles.cardImg,
                              styles.imagePlaceholder,
                            ]}
                          >
                            <Ionicons
                              name="person-outline"
                              size={42}
                              color="#94A3B8"
                            />
                          </View>
                        )}
                        <View style={styles.infoBox}>
                          <Text style={styles.name}>
                            {name}
                            {age !== null && age !== undefined ? `, ${age}` : ""}
                          </Text>
                          {item.user?.city ? (
                            <Text style={styles.sub}>{item.user.city}</Text>
                          ) : null}
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
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
              {isLoading ? (
                <Text style={styles.emptyText}>Loading likes...</Text>
              ) : liveSentLikes.length === 0 ? (
                <Text style={styles.emptyText}>
                  You haven&apos;t liked anyone yet
                </Text>
              ) : (
                <View style={styles.grid}>
                  {liveSentLikes.map((item, idx) => (
                    <TouchableOpacity
                      key={item.userId || `sent-${idx}`}
                      style={styles.card}
                      activeOpacity={0.85}
                    >
                      {item.photo ? (
                        <Image
                          source={{ uri: formatApiImageUrl(item.photo) }}
                          style={styles.cardImg}
                        />
                      ) : (
                        <View style={[styles.cardImg, styles.imagePlaceholder]}>
                          <Ionicons
                            name="person-outline"
                            size={42}
                            color="#94A3B8"
                          />
                        </View>
                      )}
                      <View style={styles.infoBox}>
                        <Text style={styles.name}>
                          {item.name}
                          {item.age !== null ? `, ${item.age}` : ""}
                        </Text>
                        {item.location || item.city ? (
                          <Text style={styles.sub}>
                            {item.location || item.city}
                          </Text>
                        ) : null}
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </ScrollView>
          </View>
        )}

        <CustomTabBar />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#FFFFFF" },
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  likesSubTabBar: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
  },
  likesSubTabItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
    position: "relative",
  },
  likesSubTabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4B5563",
    fontFamily: "DM_Sans_500Medium",
  },
  activeLikesSubTabText: {
    color: "#111827",
    fontWeight: "800",
    fontFamily: "DM_Sans_700Bold",
  },
  activeUnderline: {
    position: "absolute",
    bottom: -1,
    left: 20,
    right: 20,
    height: 3,
    backgroundColor: "#0F766E",
    borderRadius: 1.5,
  },
  sectionHeaderContainer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 4,
  },
  headerSubtitle: {
    fontFamily: "DM_Sans_400Regular",
    fontSize: 13,
    color: "#6B7280",
  },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 20, paddingTop: 10 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  emptyText: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    color: "#6B7280",
    fontSize: 14,
    fontFamily: "DM_Sans_400Regular",
    textAlign: "center",
  },
  imagePlaceholder: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E2E8F0",
  },
  card: {
    width: "48%",
    height: 160,
    borderRadius: 14,
    overflow: "hidden",
    position: "relative",
    backgroundColor: "#F1F5F9",
  },
  cardImg: { width: "100%", height: "100%", resizeMode: "cover" },
  infoBox: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 8,
  },
  name: { color: "#FFF", fontSize: 13, fontFamily: "DM_Sans_700Bold" },
  sub: { color: "#CBD5E1", fontSize: 11, fontFamily: "DM_Sans_400Regular" },
});
