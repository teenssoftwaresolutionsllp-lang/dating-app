import React, { useEffect, useState } from "react";
import {
  Animated,
  Dimensions,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { OnboardingHeader } from "@/components/onboarding-header";
import { OnboardingFooter } from "@/components/onboarding-footer";
import {
  getOnboardingProfileDraft,
  updateOnboardingProfileDraft,
} from "@/constants/userProfile";
import {
  autocompleteLocation,
  getPopularLocations,
  saveGoogleLocation,
  savePopularLocation,
  type LocationSuggestion,
} from "@/services/profileApi";
import { useTheme } from "@/hooks/use-theme";
import { useTranslation } from "react-i18next";
import {
  HyderabadIcon,
  DelhiIcon,
  ChennaiIcon,
  BengaluruIcon,
  ThiruvananthapuramIcon,
  AhmedabadIcon,
} from "@/components/illustrations/landmark-icons";

const CITIES = [
  { id: "hyderabad", name: "Hyderabad", Icon: HyderabadIcon },
  { id: "delhi", name: "Delhi", Icon: DelhiIcon },
  { id: "chennai", name: "Chennai", Icon: ChennaiIcon },
  { id: "bengaluru", name: "Bengaluru", Icon: BengaluruIcon },
  {
    id: "thiruvananthapuram",
    name: "Thiruvananthapuram",
    Icon: ThiruvananthapuramIcon,
  },
  { id: "ahmedabad", name: "Ahmedabad", Icon: AhmedabadIcon },
];

export default function LocationScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { t } = useTranslation();

  const initialDraft = getOnboardingProfileDraft();
  const fallbackCity = initialDraft.location
    ? initialDraft.location.replace(/,\s*India$/i, "").trim()
    : "";
  const initialCity =
    "locationCity" in initialDraft
      ? (initialDraft.locationCity ?? null)
      : fallbackCity || null;

  const [searchQuery, setSearchQuery] = useState(
    initialDraft.locationSearchQuery ?? "",
  );
  const [selectedCity, setSelectedCity] = useState<string | null>(initialCity);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [locationError, setLocationError] = useState(false);
  const [popularLocations, setPopularLocations] = useState<
    Array<{ locationId: string; name: string }>
  >([]);
  const [autocompleteResults, setAutocompleteResults] = useState<
    LocationSuggestion[]
  >([]);
  const [autocompleteLoading, setAutocompleteLoading] = useState(false);
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(
    initialDraft.locationId ?? null,
  );
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(
    initialDraft.locationPlaceId ?? null,
  );
  const [locationShakeAnim] = useState(() => new Animated.Value(0));

  const cityOptions = popularLocations.length
    ? popularLocations.map((location, index) => ({
      ...location,
      id: location.locationId,
      Icon: CITIES[index % CITIES.length].Icon,
    }))
    : CITIES.map((city) => ({
      id: city.id,
      locationId: null,
      name: city.name,
      Icon: city.Icon,
    }));

  const isLocationValid = Boolean(selectedCity); const triggerLocationShake = () => {
    locationShakeAnim.setValue(0);
    Animated.sequence([
      Animated.timing(locationShakeAnim, {
        toValue: -8,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(locationShakeAnim, {
        toValue: 8,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(locationShakeAnim, {
        toValue: -6,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(locationShakeAnim, {
        toValue: 6,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(locationShakeAnim, {
        toValue: -3,
        duration: 40,
        useNativeDriver: true,
      }),
      Animated.timing(locationShakeAnim, {
        toValue: 3,
        duration: 40,
        useNativeDriver: true,
      }),
      Animated.timing(locationShakeAnim, {
        toValue: 0,
        duration: 40,
        useNativeDriver: true,
      }),
    ]).start();
  };

  useEffect(() => {
    let isMounted = true;

    const loadPopularLocations = async () => {
      try {
        const data = await getPopularLocations();
        if (isMounted && data.length > 0) {
          setPopularLocations(data);
        }
      } catch {
        // fall back to static city cards if the backend is unavailable
      }
    };

    loadPopularLocations();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (
      trimmed.length < 2 ||
      selectedCity ||
      selectedLocationId ||
      selectedPlaceId
    ) {
      return;
    }

    let isCurrentRequest = true;
    const timeout = setTimeout(async () => {
      setAutocompleteLoading(true);
      try {
        const results = await autocompleteLocation(trimmed);
        if (isCurrentRequest) setAutocompleteResults(results);
      } finally {
        if (isCurrentRequest) setAutocompleteLoading(false);
      }
    }, 250);

    return () => {
      isCurrentRequest = false;
      clearTimeout(timeout);
    };
  }, [searchQuery, selectedCity, selectedLocationId, selectedPlaceId]);

  const handleNext = async () => {
    if (!selectedCity) {
      setLocationError(true);
      triggerLocationShake();
      return;
    }

    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      if (selectedLocationId) {
        await savePopularLocation(selectedLocationId);
      } else if (selectedPlaceId) {
        await saveGoogleLocation(selectedPlaceId);
      }

      updateOnboardingProfileDraft({
        location: `${selectedCity}, India`,
        locationCity: selectedCity,
        locationSearchQuery: searchQuery,
        locationId: selectedLocationId,
        locationPlaceId: selectedPlaceId,
      });

      router.push("/(onboarding)/relationship" as any);
    } catch (error) {
      console.warn("Location selection could not be saved:", error);
      setLocationError(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/birthday");
    }
  };

  const filteredCities = cityOptions.filter((city) =>
    city.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.centerContainer}>
        <OnboardingHeader progress={0.2} />

        <View style={styles.keyboardView}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Header Title & Subtitle matching Screenshot 2 */}
            <Text style={styles.title}>{t('onboarding.steps.location.title')}</Text>
            <Text style={styles.subtitle}>
              {t('onboarding.steps.location.subtitle')}
            </Text>

            {/* Capsule Search Bar matching Screenshot 2 */}
            <View style={styles.searchSection}>
              <View
                style={[
                  styles.searchContainer,
                  (isFocused || searchQuery.trim().length > 0) &&
                  styles.searchContainerActive,
                  locationError && styles.searchContainerError,
                ]}
              >
                <Ionicons
                  name="search-outline"
                  size={20}
                  color={locationError ? "#9CA3AF" : "#9CA3AF"}
                  style={styles.searchIcon}
                />
                <TextInput
                  style={[
                    styles.searchInput,
                    locationError && styles.searchInputError,
                  ]}
                  value={searchQuery}
                  onChangeText={(text) => {
                    setSearchQuery(text);
                    setSelectedCity(null);
                    setSelectedLocationId(null);
                    setSelectedPlaceId(null);
                    setAutocompleteResults([]);
                    setAutocompleteLoading(false);
                    updateOnboardingProfileDraft({
                      locationSearchQuery: text,
                      locationCity: null,
                      locationId: null,
                      locationPlaceId: null,
                    });
                    if (locationError && text.trim().length > 0) {
                      setLocationError(false);
                    }
                  }}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  selectionColor="#00E4E8"
                  placeholder={t('onboarding.steps.location.searchPlaceholder')}
                  placeholderTextColor={locationError ? "#9CA3AF" : "#9CA3AF"}
                  returnKeyType="done"
                  onSubmitEditing={handleNext}
                />
              </View>
              {searchQuery.trim().length >= 2 &&
                !selectedCity &&
                !selectedLocationId &&
                !selectedPlaceId && (
                  <View style={styles.autocompleteList}>
                    {autocompleteLoading ? (
                      <Text style={styles.noLocationResults}>
                        {t('onboarding.steps.location.searching')}
                      </Text>
                    ) : autocompleteResults.length > 0 ? (
                      autocompleteResults.slice(0, 5).map((suggestion) => (
                        <TouchableOpacity
                          key={suggestion.placeId}
                          style={styles.autocompleteItem}
                          onPress={() => {
                            const label = suggestion.mainText || suggestion.text;

                            setSearchQuery(label);
                            setSelectedCity(label);
                            setSelectedLocationId(null);
                            setSelectedPlaceId(suggestion.placeId);
                            setAutocompleteResults([]);
                            setLocationError(false);
                            updateOnboardingProfileDraft({
                              location: `${label}, India`,
                              locationCity: label,
                              locationSearchQuery: label,
                              locationId: null,
                              locationPlaceId: suggestion.placeId,
                            });
                          }}
                        >
                          <Text style={styles.autocompleteText}>
                            {suggestion.mainText || suggestion.text}
                          </Text>
                          {suggestion.secondaryText ? (
                            <Text style={styles.autocompleteSubText}>
                              {suggestion.secondaryText}
                            </Text>
                          ) : null}
                        </TouchableOpacity>
                      ))
                    ) : (
                      <Text style={styles.noLocationResults}>
                        {t('onboarding.steps.location.noResults')}
                      </Text>
                    )}
                  </View>
                )}
              {locationError && (
                <Animated.Text
                  style={[
                    styles.locationErrorMessage,
                    {
                      transform: [{ translateX: locationShakeAnim }],
                    },
                  ]}
                >
                  {t('onboarding.steps.location.locationError')}
                </Animated.Text>
              )}
            </View>

            {/* City Grid - 2 columns side by side */}
            {searchQuery.trim().length === 0 && (
              <View style={styles.citiesGrid}>
                {filteredCities.map((city) => {
                  const isSelected = selectedCity === city.name;
                  const CityIcon = city.Icon;
                  return (
                    <TouchableOpacity
                      key={city.id}
                      style={[
                        styles.cityCard,
                        isSelected && styles.cityCardSelected,
                      ]}
                      onPress={() => {
                        setSelectedCity(city.name);
                        setSelectedLocationId(city.locationId ?? null);
                        setSelectedPlaceId(null);
                        setSearchQuery("");
                        setAutocompleteResults([]);
                        setLocationError(false);
                        updateOnboardingProfileDraft({
                          location: `${city.name}, India`,
                          locationCity: city.name,
                          locationSearchQuery: "",
                          locationId: city.locationId ?? null,
                          locationPlaceId: null,
                        });
                      }}
                      activeOpacity={0.8}
                    >
                      <View style={styles.iconWrapper}>
                        <CityIcon size={42} />
                      </View>
                      <Text
                        style={[
                          styles.cityName,
                          isSelected && styles.cityNameSelected,
                        ]}
                        numberOfLines={2}
                      >
                        {city.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </ScrollView>
        </View>

        {/* Action Footer with Validation */}
        <OnboardingFooter
          showBack
          onBack={handleBack}
          onNext={handleNext}
          nextButtonStyle={{
            backgroundColor: isLocationValid ? theme.primaryButton : "#BDFFF9",
          }}
        />
      </View >
    </SafeAreaView >
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
  },
  centerContainer: {
    flex: 1,
    width: "100%",
    maxWidth: 480,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
    alignItems: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 6,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 13,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 24,
    paddingHorizontal: 12,
    lineHeight: 18,
  },
  searchSection: {
    width: "100%",
    position: "relative",
    marginBottom: 28,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    height: 48,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 24,
    paddingHorizontal: 16,
    backgroundColor: "#FFFFFF",
  },
  searchContainerActive: {
    borderColor: "#00E4E8",
  },
  searchContainerError: {
    borderColor: "#FF3B30",
    borderWidth: 1.5,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#111827",
    backgroundColor: "#FFFFFF",
    height: "100%",
    paddingVertical: 0,
    outlineStyle: "none" as any,
  },
  searchInputError: {
    color: "#FF3B30",
  },
  autocompleteList: {
    width: "100%",
    marginTop: 12,
    backgroundColor: "#F9FAFB",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    overflow: "hidden",
  },
  autocompleteItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  autocompleteText: {
    color: "#111827",
    fontSize: 15,
    fontWeight: "600",
  },
  noLocationResults: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    color: "#6B7280",
    fontSize: 14,
  },
  autocompleteSubText: {
    color: "#6B7280",
    fontSize: 12,
    marginTop: 4,
  },
  locationErrorMessage: {
    position: "absolute",
    bottom: -20,
    left: 16,
    fontSize: 12,
    fontWeight: "500",
    color: "#FF3B30",
  },
  citiesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    width: "100%",
    justifyContent: "space-between",
  },
  cityCard: {
    width: "47.5%",
    height: 118,
    backgroundColor: "#FAFFFF",
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: "#A0F0ED",
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
  },
  cityCardSelected: {
    backgroundColor: "#E0FDFD",
    borderColor: "#00F5D4",
    borderWidth: 2,
  },
  iconWrapper: {
    marginBottom: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  cityName: {
    fontSize: 13,
    fontWeight: "600",
    color: "#4B5563",
    textAlign: "center",
  },
  cityNameSelected: {
    color: "#111827",
    fontWeight: "700",
  },
});
