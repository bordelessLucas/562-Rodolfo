import { Stack } from 'expo-router';
import React from 'react';

import { RoleGate } from '@/src/components/RoleGate';
import { colors } from '@/src/theme';

export default function ProfissionalLayout() {
  return (
    <RoleGate allowedRole="profissional">
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="perfil" />
      </Stack>
    </RoleGate>
  );
}
