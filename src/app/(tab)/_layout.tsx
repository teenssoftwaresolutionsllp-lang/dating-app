import React from 'react';
import { Stack } from 'expo-router';

export default function TabLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
      <Stack.Screen name="people" />
      <Stack.Screen name="chats" />
      <Stack.Screen name="matches" />
      <Stack.Screen name="likes" />
      <Stack.Screen name="me" />
      <Stack.Screen name="home" />
      <Stack.Screen name="explore" />
    </Stack>
  );
}
