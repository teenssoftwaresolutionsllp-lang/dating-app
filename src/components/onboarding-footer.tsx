import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

interface OnboardingFooterProps {
  showBack?: boolean;
  onBack?: () => void;
  onNext: () => void;
  nextText?: string;
  disabled?: boolean;
  nextButtonStyle?: StyleProp<ViewStyle>;
}

export function   OnboardingFooter({
  showBack = false,
  onBack,
  onNext,
  nextText,
  disabled = false,
  nextButtonStyle,
}: OnboardingFooterProps) {
  const { t } = useTranslation();
  const label = nextText || t('common.next');
  return (
    <View style={styles.container}>
      {showBack && (
        <TouchableOpacity
          style={styles.backButton}
          onPress={onBack}
          activeOpacity={0.8}
          accessibilityLabel={t('common.goBack')}
        >
          <Ionicons name="arrow-back" size={24} color="#000000" />
        </TouchableOpacity>
      )}
      <TouchableOpacity
        style={[
          styles.nextButton,
          !showBack && styles.nextButtonFull,
          disabled && styles.nextButtonDisabled,
          nextButtonStyle,
        ]}
        onPress={onNext}
        disabled={disabled}
        activeOpacity={0.8}
      >
        <Text style={styles.nextText}>{label}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 54,
    paddingTop: 12,
    gap: 14,
    width: '100%',
  },
  backButton: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#00E4E8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButton: {
    flex: 1,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#00E4E8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButtonFull: {
    width: '100%',
  },
  nextButtonDisabled: {
    opacity: 0.6,
  },
  nextText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '700',
  },
});
