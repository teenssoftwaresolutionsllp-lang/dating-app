import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';

interface HeaderStatusBarProps {
  title: string;
  showSearchIcon?: boolean;
}

export const HeaderStatusBar: React.FC<HeaderStatusBarProps> = ({ title }) => {
  return (
    <View style={styles.container}>
      {/* Screen Title */}
      <View style={styles.titleContainer}>
        <Text style={styles.titleText}>{title}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 30 : 30,
    paddingBottom: 8,
  },
  titleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  titleText: {
    fontFamily: 'DM_Sans_700Bold',
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
  },
});
