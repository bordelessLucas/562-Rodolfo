import { Stack } from 'expo-router';
import React from 'react';

import { RoleGate } from '@/src/components/RoleGate';
import { colors } from '@/src/theme';

export default function AdminLayout() {
  return (
    <RoleGate allowedRole="admin">
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      />
    </RoleGate>
  );
}
