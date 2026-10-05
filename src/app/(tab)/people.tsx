import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { HeaderStatusBar } from "@/components/HeaderStatusBar";
import { CustomTabBar } from "@/components/CustomTabBar";
import { formatApiImageUrl } from "@/services/api";
import {
  getPeopleCategories,
  type PeopleCategoriesResponse,
} from "@/services/matchApi";

interface PeopleScreenProps {
  showTabBar?: boolean;
  showHeaderBar?: boolean;
}

export default function PeopleScreen({
  showTabBar = true,
  showHeaderBar = true,
}: PeopleScreenProps = {}) {
  const [categories, setCategories] =
    React.useState<PeopleCategoriesResponse | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    getPeopleCategories()
      .then((res) => {
        setCategories(res);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const navigateToViewAll = (sectionId: string, title: string) => {
    router.push({
      pathname: "/view-all",
      params: { sectionId, title },
    });
  };

  const emptyMessage = isLoading
    ? "Loading people..."
    : categories
      ? "No matching people right now"
      : "People could not be loaded";
  const renderEmptyMessage = (users: unknown[]) =>
    users.length === 0 ? (
      <Text style={styles.emptyListText}>{emptyMessage}</Text>
    ) : null;

  const activeUsers = (categories?.active ?? []).map((u) => ({
    id: u.id,
    name: u.name,
    age: u.age,
    image: u.image ? { uri: formatApiImageUrl(u.image) } : undefined,
    isOnline: u.isOnline,
  }));

  const nearYouUsers = (categories?.nearYou ?? []).map((u) => ({
    id: u.id,
    name: u.name,
    age: u.age,
    location: u.city || u.location,
    distance: u.distance,
    image: u.image ? { uri: formatApiImageUrl(u.image) } : undefined,
  }));

  const youMayLikeUsers = (categories?.youMayLike ?? []).map((u) => ({
    id: u.id,
    name: u.name,
    age: u.age,
    profession: u.profession,
    matchPercentage: u.matchPercentage,
    image: u.image ? { uri: formatApiImageUrl(u.image) } : undefined,
  }));

  const similarInterestUsers = (categories?.similarInterest ?? []).map((u) => ({
    id: u.id,
    name: u.name,
    age: u.age,
    interest: u.interest,
    image: u.image ? { uri: formatApiImageUrl(u.image) } : undefined,
  }));

  const sameReligionUsers = (categories?.sameReligion ?? []).map((u) => ({
    id: u.id,
    name: u.name,
    age: u.age,
    religion: u.religion,
    image: u.image ? { uri: formatApiImageUrl(u.image) } : undefined,
  }));

  const recentlyActiveUsers = (categories?.recentlyActive ?? []).map((u) => ({
    id: u.id,
    name: u.name,
    age: u.age,
    timeAgo: u.timeAgo,
    image: u.image ? { uri: formatApiImageUrl(u.image) } : undefined,
  }));

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.mainContainer}>
        {showHeaderBar && <HeaderStatusBar title="People" />}

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Section 1: Active */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Active</Text>
            <TouchableOpacity
              onPress={() => navigateToViewAll("active", "Active")}
              activeOpacity={0.7}
            >
              <Text style={styles.viewAllText}>View all</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
          >
            {renderEmptyMessage(activeUsers)}
            {activeUsers.map((user) => (
              <TouchableOpacity
                key={user.id}
                style={styles.activeUserItem}
                activeOpacity={0.8}
                onPress={() => navigateToViewAll("active", "Active")}
              >
                <View style={styles.avatarBorderRing}>
                  <Image source={user.image} style={styles.activeAvatarImage} />
                </View>
                <Text style={styles.userNameText}>
                  {user.name}, {user.age}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Section 2: People Near You */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>People Near You</Text>
            <TouchableOpacity
              onPress={() => navigateToViewAll("near_you", "People Near You")}
              activeOpacity={0.7}
            >
              <Text style={styles.viewAllText}>View all</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
          >
            {renderEmptyMessage(nearYouUsers)}
            {nearYouUsers.map((user) => (
              <TouchableOpacity
                key={user.id}
                style={styles.cardItem}
                activeOpacity={0.85}
                onPress={() => navigateToViewAll("near_you", "People Near You")}
              >
                <View style={styles.cardImageContainer}>
                  <Image source={user.image} style={styles.cardImage} />
                  <View style={styles.distanceBadge}>
                    <Text style={styles.distanceBadgeText}>
                      {user.distance}
                    </Text>
                  </View>
                </View>
                <Text style={styles.cardNameText}>
                  {user.name}, {user.age}
                </Text>
                {user.location ? (
                  <Text style={styles.cardSubtitleText}>{user.location}</Text>
                ) : null}
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Section 3: You May Like */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>You May Like</Text>
            <TouchableOpacity
              onPress={() => navigateToViewAll("you_may_like", "You May Like")}
              activeOpacity={0.7}
            >
              <Text style={styles.viewAllText}>View all</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
          >
            {renderEmptyMessage(youMayLikeUsers)}
            {youMayLikeUsers.map((user) => (
              <TouchableOpacity
                key={user.id}
                style={styles.cardItem}
                activeOpacity={0.85}
                onPress={() =>
                  navigateToViewAll("you_may_like", "You May Like")
                }
              >
                <View style={styles.cardImageContainer}>
                  <Image source={user.image} style={styles.cardImage} />
                  <View style={styles.matchBadge}>
                    <Text style={styles.matchPercentageText}>
                      {user.matchPercentage}%
                    </Text>
                    <Text style={styles.matchLabelText}>Match</Text>
                  </View>
                </View>
                <Text style={styles.cardNameText}>
                  {user.name}, {user.age}
                </Text>
                {user.profession ? (
                  <Text style={styles.cardSubtitleText}>{user.profession}</Text>
                ) : null}
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Section 4: Similar Interest */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Similar Interest</Text>
            <TouchableOpacity
              onPress={() =>
                navigateToViewAll("similar_interest", "Similar Interest")
              }
              activeOpacity={0.7}
            >
              <Text style={styles.viewAllText}>View all</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
          >
            {renderEmptyMessage(similarInterestUsers)}
            {similarInterestUsers.map((user) => (
              <TouchableOpacity
                key={user.id}
                style={styles.circleUserItem}
                activeOpacity={0.85}
                onPress={() =>
                  navigateToViewAll("similar_interest", "Similar Interest")
                }
              >
                <View style={styles.circleAvatarWrapper}>
                  <Image source={user.image} style={styles.circleAvatarImage} />
                </View>
                <Text style={styles.userNameText}>
                  {user.name}, {user.age}
                </Text>
                {user.interest ? (
                  <Text style={styles.circleSubtitleText}>{user.interest}</Text>
                ) : null}
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Section 5: Same Religion */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Same Religion</Text>
            <TouchableOpacity
              onPress={() =>
                navigateToViewAll("same_religion", "Same Religion")
              }
              activeOpacity={0.7}
            >
              <Text style={styles.viewAllText}>View all</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
          >
            {renderEmptyMessage(sameReligionUsers)}
            {sameReligionUsers.map((user) => (
              <TouchableOpacity
                key={user.id}
                style={styles.circleUserItem}
                activeOpacity={0.85}
                onPress={() =>
                  navigateToViewAll("same_religion", "Same Religion")
                }
              >
                <View style={styles.circleAvatarWrapper}>
                  <Image source={user.image} style={styles.circleAvatarImage} />
                </View>
                <Text style={styles.userNameText}>
                  {user.name}, {user.age}
                </Text>
                {user.religion ? (
                  <Text style={styles.circleSubtitleText}>{user.religion}</Text>
                ) : null}
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Section 6: Recently Active */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recently Active</Text>
            <TouchableOpacity
              onPress={() =>
                navigateToViewAll("recently_active", "Recently Active")
              }
              activeOpacity={0.7}
            >
              <Text style={styles.viewAllText}>View all</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
          >
            {renderEmptyMessage(recentlyActiveUsers)}
            {recentlyActiveUsers.map((user) => (
              <TouchableOpacity
                key={user.id}
                style={styles.circleUserItem}
                activeOpacity={0.85}
                onPress={() =>
                  navigateToViewAll("recently_active", "Recently Active")
                }
              >
                <View style={styles.circleAvatarWrapper}>
                  <Image source={user.image} style={styles.circleAvatarImage} />
                </View>
                <Text style={styles.userNameText}>
                  {user.name}, {user.age}
                </Text>
                <Text style={styles.circleSubtitleText}>{user.timeAgo}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </ScrollView>

        {showTabBar && <CustomTabBar />}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  mainContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollContent: {
    paddingBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontFamily: "DM_Sans_700Bold",
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  viewAllText: {
    fontFamily: "DM_Sans_500Medium",
    fontSize: 13,
    fontWeight: "600",
    color: "#00BCD4",
  },
  horizontalList: {
    paddingHorizontal: 16,
    paddingBottom: 6,
  },
  emptyListText: {
    fontFamily: "DM_Sans_400Regular",
    fontSize: 13,
    color: "#8E8E93",
    paddingHorizontal: 4,
    paddingVertical: 12,
  },
  /* Active Users Section Styles */
  activeUserItem: {
    alignItems: "center",
    marginHorizontal: 8,
    width: 72,
  },
  avatarBorderRing: {
    width: 66,
    height: 66,
    borderRadius: 33,
    borderWidth: 2.5,
    borderColor: "#00E676",
    padding: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  activeAvatarImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#E2E8F0",
  },
  userNameText: {
    fontFamily: "DM_Sans_700Bold",
    fontSize: 13,
    fontWeight: "700",
    color: "#111827",
    marginTop: 6,
    textAlign: "center",
  },
  /* Circle User Items (Similar Interest, Same Religion, Recently Active) */
  circleUserItem: {
    alignItems: "center",
    marginHorizontal: 8,
    width: 72,
  },
  circleAvatarWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    overflow: "hidden",
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
  },
  circleAvatarImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  circleSubtitleText: {
    fontFamily: "DM_Sans_400Regular",
    fontSize: 11,
    color: "#8E8E93",
    marginTop: 2,
    textAlign: "center",
  },
  /* Cards Styles for Near You / You May Like */
  cardItem: {
    width: 115,
    marginHorizontal: 6,
  },
  cardImageContainer: {
    width: 115,
    height: 140,
    borderRadius: 16,
    overflow: "hidden",
    position: "relative",
    backgroundColor: "#F1F5F9",
  },
  cardImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  distanceBadge: {
    position: "absolute",
    bottom: 8,
    alignSelf: "center",
    backgroundColor: "rgba(15, 23, 42, 0.75)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  distanceBadgeText: {
    fontFamily: "DM_Sans_500Medium",
    fontSize: 10,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  matchBadge: {
    position: "absolute",
    bottom: 8,
    right: 8,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#E91E63",
    justifyContent: "center",
    alignItems: "center",
    padding: 2,
    elevation: 3,
    shadowColor: "#E91E63",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 3,
  },
  matchPercentageText: {
    fontFamily: "DM_Sans_700Bold",
    fontSize: 10,
    fontWeight: "700",
    color: "#FFFFFF",
    lineHeight: 12,
  },
  matchLabelText: {
    fontFamily: "DM_Sans_400Regular",
    fontSize: 8,
    color: "#FFFFFF",
    lineHeight: 10,
  },
  cardNameText: {
    fontFamily: "DM_Sans_700Bold",
    fontSize: 13,
    fontWeight: "700",
    color: "#111827",
    marginTop: 6,
  },
  cardSubtitleText: {
    fontFamily: "DM_Sans_400Regular",
    fontSize: 11,
    color: "#8E8E93",
    marginTop: 2,
  },
});
