import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { swipeUser } from "@/services/matchApi";
import { formatApiImageUrl } from "@/services/api";

export interface PeopleProfilePreview {
  id: string;
  name: string;
  age: number | null;
  image: string | null;
  subtitle?: string;
  alreadyLiked?: boolean;
}

interface PeopleProfileModalProps {
  profile: PeopleProfilePreview | null;
  onClose: () => void;
  onUnlike?: (profileId: string) => void;
}

export function PeopleProfileModal({
  profile,
  onClose,
  onUnlike,
}: PeopleProfileModalProps) {
  const [isSavingLike, setIsSavingLike] = useState(false);
  const [likedProfileId, setLikedProfileId] = useState<string | null>(null);
  const isLiked =
    profile?.alreadyLiked === true || profile?.id === likedProfileId;

  const handleLike = async () => {
    if (!profile || isSavingLike || isLiked) return;

    setIsSavingLike(true);
    try {
      const result = await swipeUser(profile.id, "like");
      setLikedProfileId(profile.id);
      if (result.isMatch) {
        Alert.alert("It's a match!", `You and ${profile.name} liked each other.`);
      }
    } catch (error) {
      console.warn("Failed to like People profile:", error);
      Alert.alert(
        "Couldn't send like",
        error instanceof Error ? error.message : "Please try again.",
      );
    } finally {
      setIsSavingLike(false);
    }
  };

  const handleUnlike = async () => {
    if (!profile || isSavingLike) return;

    setIsSavingLike(true);
    try {
      await swipeUser(profile.id, "dislike");
      onUnlike?.(profile.id);
      onClose();
    } catch (error) {
      console.warn("Failed to unlike People profile:", error);
      Alert.alert(
        "Couldn't remove like",
        error instanceof Error ? error.message : "Please try again.",
      );
    } finally {
      setIsSavingLike(false);
    }
  };

  const handleMessage = () => {
    if (!profile) return;
    const partnerId = profile.id;
    const partnerName = profile.name;
    const partnerPhoto = profile.image
      ? formatApiImageUrl(profile.image)
      : "";
    onClose();
    router.push({
      pathname: "/(tab)/chats",
      params: { partnerId, partnerName, partnerPhoto },
    });
  };

  return (
    <Modal
      visible={Boolean(profile)}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      {profile ? (
        <View style={styles.overlay}>
          <View style={styles.modalCard}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Close profile"
            >
              <Ionicons name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>

            {profile.image ? (
              <Image
                source={{ uri: formatApiImageUrl(profile.image) }}
                style={styles.profileImage}
                resizeMode="cover"
              />
            ) : (
              <View style={[styles.profileImage, styles.imagePlaceholder]}>
                <Ionicons name="person-outline" size={64} color="#94A3B8" />
              </View>
            )}

            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>
                {profile.name}
                {profile.age !== null ? `, ${profile.age}` : ""}
              </Text>
              {profile.subtitle ? (
                <Text style={styles.profileSubtitle}>{profile.subtitle}</Text>
              ) : null}

              <View style={styles.actions}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.likeButton]}
                  onPress={() =>
                    void (profile.alreadyLiked ? handleUnlike() : handleLike())
                  }
                  disabled={isSavingLike || (isLiked && !profile.alreadyLiked)}
                  activeOpacity={0.8}
                  accessibilityRole="button"
                  accessibilityLabel={
                    profile.alreadyLiked
                      ? "Unlike profile"
                      : isLiked
                        ? "Profile liked"
                        : "Like profile"
                  }
                >
                  {isSavingLike ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Ionicons
                      name={
                        profile.alreadyLiked
                          ? "heart-dislike-outline"
                          : isLiked
                            ? "heart"
                            : "heart-outline"
                      }
                      size={19}
                      color="#FFFFFF"
                    />
                  )}
                  <Text style={styles.actionButtonText}>
                    {profile.alreadyLiked
                      ? "Unlike"
                      : isLiked
                        ? "Liked"
                        : "Like"}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, styles.messageButton]}
                  onPress={handleMessage}
                  activeOpacity={0.8}
                  accessibilityRole="button"
                  accessibilityLabel={`Message ${profile.name}`}
                >
                  <Ionicons
                    name="chatbubble-outline"
                    size={19}
                    color="#0D7A74"
                  />
                  <Text style={[styles.actionButtonText, styles.messageText]}>
                    Message
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      ) : null}
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.88)",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  modalCard: {
    width: "100%",
    maxWidth: 440,
    overflow: "hidden",
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
  },
  closeButton: {
    position: "absolute",
    zIndex: 1,
    top: 14,
    right: 14,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(15, 23, 42, 0.55)",
  },
  profileImage: {
    width: "100%",
    height: 420,
    backgroundColor: "#F1F5F9",
  },
  imagePlaceholder: {
    alignItems: "center",
    justifyContent: "center",
  },
  profileInfo: {
    padding: 20,
  },
  profileName: {
    color: "#111827",
    fontSize: 22,
    fontWeight: "700",
  },
  profileSubtitle: {
    marginTop: 4,
    color: "#64748B",
    fontSize: 14,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 18,
  },
  actionButton: {
    minHeight: 48,
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 14,
  },
  likeButton: {
    backgroundColor: "#E5486D",
  },
  messageButton: {
    borderWidth: 1,
    borderColor: "#0D7A74",
    backgroundColor: "#FFFFFF",
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  messageText: {
    color: "#0D7A74",
  },
});
