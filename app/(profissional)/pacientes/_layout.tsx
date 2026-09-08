import { Stack } from 'expo-router';
import React from 'react';

import { colors } from '@/src/theme';

export default function PacientesLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="[patientId]" />
    </Stack>
  );
}
