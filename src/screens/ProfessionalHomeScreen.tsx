import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, type Href } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import {
  Button,
  Container,
  ScreenHeader,
  Typography,
} from '@/src/components';
import { useAuth } from '@/src/hooks/useAuth';
import { colors, radius, space } from '@/src/theme';

export function ProfessionalHomeScreen() {
  const router = useRouter();
  const { profile, signOut } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await signOut();
      router.replace('/login');
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <Container contentStyle={styles.content}>
      <LinearGradient
        colors={[colors.backgroundAccent, colors.background]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.wash}
      />

      <ScreenHeader
        eyebrow="Profissional de saúde"
        title={`Olá, ${profile?.name?.split(' ')[0] ?? 'profissional'}`}
        subtitle="Área dedicada a quem trabalha com lipedema — funcionalidades serão liberadas conforme o escopo."
      />

      <View style={styles.card}>
        <Typography variant="h3">Em construção</Typography>
        <Typography variant="body" color={colors.textMuted}>
          Em breve: ferramentas e conteúdos específicos para o seu perfil. Por
          enquanto você já pode gerenciar sua conta.
        </Typography>
      </View>

      <Button
        label="Abrir perfil"
        onPress={() => router.push('/(profissional)/perfil' as Href)}
      />
      <Button
        label="Sair"
        variant="outline"
        loading={loggingOut}
        onPress={handleLogout}
      />
    </Container>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: space[5],
    position: 'relative',
  },
  wash: {
    ...StyleSheet.absoluteFillObject,
    height: '40%',
  },
  card: {
    zIndex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: space[5],
    gap: space[3],
  },
});
