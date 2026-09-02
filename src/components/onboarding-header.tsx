import React from 'react';
import { View, StyleSheet } from 'react-native';

interface OnboardingHeaderProps {
  progress: number; // e.g. 0.25 for 25%, 0.50 for 50%, etc.
}

export function OnboardingHeader({ progress }: OnboardingHeaderProps) {
  const percentage = Math.min(Math.max(progress, 0), 1) * 100;

  return (
    <View style={styles.container}>
      <View style={styles.progressBarBackground}>
        <View style={[styles.progressBarFill, { width: `${percentage}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 16,
    width: '100%',
  },
  progressBarBackground: {
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    overflow: 'hidden',
    width: '100%',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#00F5D4',
    borderRadius: 2,
  },
});
