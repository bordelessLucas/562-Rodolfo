import { Stack } from 'expo-router';
import React from 'react';

import { colors } from '@/src/theme';

/** Stack de cursos aninhado sob Explorar — nunca é ícone na bottom bar. */
export default function PacienteCursosLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        animation: 'slide_from_right',
      }}
    />
  );
}
