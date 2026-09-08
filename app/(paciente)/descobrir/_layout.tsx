import { Stack } from 'expo-router';
import React from 'react';

import { colors } from '@/src/theme';

/**
 * Stack da tab Explorar: hub + catálogo/detalhe/aula de cursos.
 * Mantém o foco na tab Explorar (cursos não são 5ª tab).
 */
export default function DescobrirLayout() {
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
