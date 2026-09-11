import { Stack } from 'expo-router';
import React from 'react';

export default function OnboardingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="set-profile" />
      <Stack.Screen name="birthday" />
      <Stack.Screen name="location" />
      <Stack.Screen name="relationship" />
      <Stack.Screen name="languages" />
      <Stack.Screen name="qualification" />
      <Stack.Screen name="study" />
      <Stack.Screen name="profession" />
      <Stack.Screen name="company" />
      <Stack.Screen name="income" />
      <Stack.Screen name="verification" />
      <Stack.Screen name="photos" />
      <Stack.Screen name="interests" />
      <Stack.Screen name="religion" />
      <Stack.Screen name="looking-for" />
      <Stack.Screen name="ideal-match" />
      <Stack.Screen name="ready" />
    </Stack>
  );
}
