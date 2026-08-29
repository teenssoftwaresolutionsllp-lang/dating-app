import { Stack } from 'expo-router';
import React from 'react';

export default function OnboardingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="set-profile" />
      <Stack.Screen name="birthday" />
      <Stack.Screen name="location" />
      <Stack.Screen name="relationship" />
    </Stack>
  );
}
