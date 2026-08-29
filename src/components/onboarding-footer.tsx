import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface OnboardingFooterProps {
  showBack?: boolean;
  onBack?: () => void;
  onNext: () => void;
  nextText?: string;
  disabled?: boolean;
}

export function OnboardingFooter({
  showBack = false,
  onBack,
  onNext,
  nextText = 'Next',
  disabled = false,
}: OnboardingFooterProps) {
  return (
    <View style={styles.container}>
      {showBack && (
        <TouchableOpacity
          style={styles.backButton}
          onPress={onBack}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={24} color="#000000" />
        </TouchableOpacity>
      )}
      <TouchableOpacity
        style={[
          styles.nextButton,
          !showBack && styles.nextButtonFull,
          disabled && styles.nextButtonDisabled,
        ]}
        onPress={onNext}
        disabled={disabled}
        activeOpacity={0.85}
      >
        <Text style={styles.nextText}>{nextText}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 24,
    paddingTop: 12,
    gap: 14,
    width: '100%',
  },
  backButton: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#00F5D4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButton: {
    flex: 1,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#00F5D4',
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
