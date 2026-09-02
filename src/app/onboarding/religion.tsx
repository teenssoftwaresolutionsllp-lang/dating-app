import { router } from 'expo-router';
import { useState } from 'react';
import { Modal, Platform, Pressable, StyleSheet, Text, View, ScrollView, TouchableWithoutFeedback } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/use-theme';

export default function ReligionScreen() {
  const theme = useTheme();
  const isDark = theme.text === '#ffffff';
  const insets = useSafeAreaInsets();

  const religionOptions = [
    'Hindu',
    'Muslim',
    'Christian',
    'Sikh',
    'Jain',
    'Buddhist',
    'Parsi / Zoroastrian',
    'Jewish',
    'Spiritual - not religious',
    'Agnostic',
    'Atheist',
    'Other',
    'Open to all',
  ];

  const [selectedReligion, setSelectedReligion] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const handleSelect = (religion: string) => {
    setSelectedReligion(religion);
    setModalVisible(false);
  };

  const handleNext = () => {
    router.push({
      pathname: '/onboarding/looking-for',
      params: { religion: selectedReligion || 'Not specified' },
    });
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]} edges={['top', 'bottom', 'left', 'right']}>
      <View style={styles.responsiveContainer}>
        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { backgroundColor: isDark ? '#333333' : '#E0E0E0' }]}>
            <View style={[styles.progressFill, { width: '72%', backgroundColor: theme.primaryButton }]} />
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <Text style={[styles.title, { color: theme.text }]}>What are you into?</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Tell us a little about yourself so we can help you find better matches.
          </Text>

          {/* Section Header */}
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Religion & Community</Text>
          </View>

          {/* Religion Select Box */}
          <Pressable
            onPress={() => setModalVisible(true)}
            style={[
              styles.selectBox,
              {
                borderColor: selectedReligion ? theme.primaryButton : isDark ? '#3E4044' : '#B9B9B9',
                backgroundColor: isDark ? theme.backgroundElement : '#FFFFFF',
              },
              Platform.OS === 'web' && ({ cursor: 'pointer' } as any),
            ]}
            accessibilityRole="button"
          >
            <Text
              style={[
                styles.selectBoxText,
                {
                  color: selectedReligion ? theme.text : theme.textSecondary,
                  fontFamily: selectedReligion ? 'DM_Sans_500Medium' : 'DM_Sans_400Regular',
                },
              ]}
            >
              {selectedReligion || 'Select Religion / Community'}
            </Text>
            <Ionicons
              name="chevron-down"
              size={20}
              color={selectedReligion ? theme.primaryButton : theme.textSecondary}
            />
          </Pressable>
        </ScrollView>

        {/* Footer Navigation */}
        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          <Pressable
            onPress={() => router.back()}
            style={[
              styles.backButton,
              { backgroundColor: theme.primaryButton },
              Platform.OS === 'web' && ({ cursor: 'pointer' } as any),
            ]}
            accessibilityRole="button"
          >
            <Ionicons name="arrow-back" size={24} color="#000000" />
          </Pressable>

          <Pressable
            onPress={handleNext}
            style={[
              styles.nextButton,
              {
                backgroundColor: theme.primaryButton,
              },
              Platform.OS === 'web' && ({ cursor: 'pointer' } as any),
            ]}
            accessibilityRole="button"
          >
            <Text style={styles.nextButtonText}>Next</Text>
          </Pressable>
        </View>
      </View>

      {/* Selection Modal Sheet */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View
                style={[
                  styles.modalContent,
                  {
                    backgroundColor: isDark ? '#1F2022' : '#FFFFFF',
                    paddingBottom: Math.max(insets.bottom, 20),
                  },
                ]}
              >
                {/* Modal Header */}
                <View style={styles.modalHeader}>
                  <Text style={[styles.modalTitle, { color: theme.text }]}>Select Religion / Community</Text>
                  <Pressable
                    onPress={() => setModalVisible(false)}
                    hitSlop={10}
                    style={Platform.OS === 'web' ? ({ cursor: 'pointer' } as any) : {}}
                  >
                    <Ionicons name="close" size={24} color={theme.text} />
                  </Pressable>
                </View>

                {/* Options List */}
                <ScrollView style={styles.modalList} showsVerticalScrollIndicator={false}>
                  {religionOptions.map((item) => {
                    const isSelected = selectedReligion === item;
                    return (
                      <Pressable
                        key={item}
                        onPress={() => handleSelect(item)}
                        style={[
                          styles.modalOption,
                          isSelected && { backgroundColor: isDark ? '#2B2D31' : '#E0F7FA' },
                          Platform.OS === 'web' && ({ cursor: 'pointer' } as any),
                        ]}
                      >
                        <Text
                          style={[
                            styles.modalOptionText,
                            {
                              color: isSelected ? (isDark ? theme.primaryButton : '#007A80') : theme.text,
                              fontFamily: isSelected ? 'DM_Sans_700Bold' : 'DM_Sans_400Regular',
                            },
                          ]}
                        >
                          {item}
                        </Text>
                        {isSelected && (
                          <Ionicons name="checkmark-circle" size={20} color={theme.primaryButton} />
                        )}
                      </Pressable>
                    );
                  })}
                </ScrollView>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    alignItems: 'center',
  },
  responsiveContainer: {
    flex: 1,
    width: '100%',
    maxWidth: 480,
    justifyContent: 'space-between',
  },
  progressContainer: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 24,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    width: '100%',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  title: {
    fontFamily: 'DM_Sans_700Bold',
    fontSize: 24,
    textAlign: 'center',
    marginTop: 10,
  },
  subtitle: {
    fontFamily: 'DM_Sans_400Regular',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
    alignSelf: 'center',
    maxWidth: 290,
  },
  sectionHeader: {
    marginTop: 36,
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: 'DM_Sans_700Bold',
    fontSize: 16,
  },
  selectBox: {
    height: 52,
    borderRadius: 26,
    borderWidth: 1,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectBoxText: {
    fontSize: 15,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButton: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButtonText: {
    fontFamily: 'DM_Sans_700Bold',
    fontSize: 16,
    color: '#000000',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  modalContent: {
    width: '100%',
    maxWidth: 500,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingHorizontal: 24,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#888888',
  },
  modalTitle: {
    fontFamily: 'DM_Sans_700Bold',
    fontSize: 18,
  },
  modalList: {
    marginTop: 8,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginVertical: 2,
  },
  modalOptionText: {
    fontSize: 15,
  },
});
