import {
  Literata_400Regular,
  Literata_600SemiBold,
} from '@expo-google-fonts/literata';
import {
  SourceSans3_400Regular,
  SourceSans3_500Medium,
  SourceSans3_600SemiBold,
} from '@expo-google-fonts/source-sans-3';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { AuthProvider } from '@/src/contexts/AuthContext';
import { ToastProvider } from '@/src/contexts/ToastContext';
import { colors } from '@/src/theme';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Literata_400Regular,
    Literata_600SemiBold,
    SourceSans3_400Regular,
    SourceSans3_500Medium,
    SourceSans3_600SemiBold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      void SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  // Sempre monta o navigator: retornar `null` enquanto as fontes carregam
  // atrasa o NavigationContainer e dispara o warning do expo-router
  // (useLinking setState antes do mount — Linking.getInitialURL).
  // O splash continua visível via preventAutoHideAsync até hideAsync.
  return (
    <AuthProvider>
      <ToastProvider>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.background },
            animation: 'fade',
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="login" />
          <Stack.Screen name="register" />
          <Stack.Screen name="(paciente)" />
          <Stack.Screen name="(profissional)" />
          <Stack.Screen name="(admin)" />
        </Stack>
        <StatusBar style="dark" />
      </ToastProvider>
    </AuthProvider>
  );
}
