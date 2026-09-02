import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { OnboardingHeader } from '@/components/onboarding-header';
import { OnboardingFooter } from '@/components/onboarding-footer';
import {
  HyderabadIcon,
  DelhiIcon,
  ChennaiIcon,
  BengaluruIcon,
  ThiruvananthapuramIcon,
  AhmedabadIcon,
} from '@/components/illustrations/landmark-icons';

const CITIES = [
  { id: 'hyderabad', name: 'Hyderabad', Icon: HyderabadIcon },
  { id: 'delhi', name: 'Delhi', Icon: DelhiIcon },
  { id: 'chennai', name: 'Chennai', Icon: ChennaiIcon },
  { id: 'bengaluru', name: 'Bengaluru', Icon: BengaluruIcon },
  { id: 'thiruvananthapuram', name: 'Thiruvananthapuram', Icon: ThiruvananthapuramIcon },
  { id: 'ahmedabad', name: 'Ahmedabad', Icon: AhmedabadIcon },
];

export default function LocationScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState<string | null>(null);

  const isLocationValid = Boolean(selectedCity || searchQuery.trim().length > 0);

  const handleNext = () => {
    if (!isLocationValid) return;
    router.push('/relationship' as any);
  };

  const handleBack = () => {
    router.back();
  };

  const filteredCities = CITIES.filter((city) =>
    city.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <OnboardingHeader progress={0.75} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header Title & Subtitle matching Screenshot 2 */}
          <Text style={styles.title}>Set your location</Text>
          <Text style={styles.subtitle}>
            {"Choose where you'd like to meet people and find better matches."}
          </Text>

          {/* Capsule Search Bar matching Screenshot 2 */}
          <View style={styles.searchContainer}>
            <Ionicons name="search-outline" size={20} color="#9CA3AF" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={(text) => {
                setSearchQuery(text);
              }}
              placeholder="Search for Near by location"
              placeholderTextColor="#9CA3AF"
              returnKeyType="done"
              onSubmitEditing={handleNext}
            />
          </View>

          {/* City Grid - 2 columns side by side */}
          <View style={styles.citiesGrid}>
            {filteredCities.map((city) => {
              const isSelected = selectedCity === city.id;
              const CityIcon = city.Icon;
              return (
                <TouchableOpacity
                  key={city.id}
                  style={[
                    styles.cityCard,
                    isSelected && styles.cityCardSelected,
                  ]}
                  onPress={() => setSelectedCity(city.id)}
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
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Action Footer with Validation */}
      <OnboardingFooter
        showBack
        onBack={handleBack}
        onNext={handleNext}
        disabled={!isLocationValid}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 12,
    lineHeight: 18,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: 48,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 24,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    marginBottom: 28,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
    backgroundColor: '#FFFFFF',
    height: '100%',
    paddingVertical: 0,
    ...(Platform.OS === 'web' ? ({ outlineStyle: 'none' } as any) : {}),
  },
  citiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    width: '100%',
    justifyContent: 'space-between',
  },
  cityCard: {
    width: '47.5%',
    height: 118,
    backgroundColor: '#FAFFFF',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#A0F0ED',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  cityCardSelected: {
    backgroundColor: '#E0FDFD',
    borderColor: '#00F5D4',
    borderWidth: 2,
  },
  iconWrapper: {
    marginBottom: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cityName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4B5563',
    textAlign: 'center',
  },
  cityNameSelected: {
    color: '#111827',
    fontWeight: '700',
  },
});
