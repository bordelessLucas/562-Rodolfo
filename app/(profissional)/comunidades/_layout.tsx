import { Stack } from 'expo-router';
import React from 'react';

import { colors } from '@/src/theme';

export default function ProfissionalComunidadesLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    />
  );
}
