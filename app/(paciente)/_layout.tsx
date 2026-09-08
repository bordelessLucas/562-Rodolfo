import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Platform } from 'react-native';

import { RoleGate } from '@/src/components/RoleGate';
import { colors, fonts } from '@/src/theme';

export default function PacienteLayout() {
  return (
    <RoleGate allowedRole="paciente">
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textMuted,
          tabBarLabelStyle: {
            fontFamily: fonts.bodyMedium,
            fontSize: 11,
            marginBottom: Platform.OS === 'ios' ? 0 : 4,
          },
          tabBarStyle: {
            backgroundColor: colors.surface,
            borderTopColor: colors.border,
            borderTopWidth: 1,
            height: Platform.OS === 'ios' ? 88 : 64,
            paddingTop: 6,
          },
        }}
      >
        <Tabs.Screen
          name="inicio"
          options={{
            title: 'Início',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? 'home' : 'home-outline'}
                color={color}
                size={22}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="checkin"
          options={{
            title: 'Check-in',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? 'calendar' : 'calendar-outline'}
                color={color}
                size={22}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="historico"
          options={{
            title: 'Histórico',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? 'time' : 'time-outline'}
                color={color}
                size={22}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="descobrir"
          options={{
            title: 'Explorar',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? 'compass' : 'compass-outline'}
                color={color}
                size={22}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="perfil"
          options={{
            title: 'Perfil',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? 'person' : 'person-outline'}
                color={color}
                size={22}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="vinculos"
          options={{
            href: null,
            title: 'Vínculos',
          }}
        />
      </Tabs>
    </RoleGate>
  );
}
