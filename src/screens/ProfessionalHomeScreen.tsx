import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, type Href } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import {
  Button,
  Container,
  ScreenHeader,
  SectionCard,
  Typography,
} from '@/src/components';
import { useAuth } from '@/src/hooks/useAuth';
import { colors, space } from '@/src/theme';

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
        eyebrow="Área profissional"
        title={`Olá, ${profile?.name?.split(' ')[0] ?? 'profissional'}`}
        subtitle="Gerencie pacientes vinculados e elabore conteúdos educativos."
      />

      <SectionCard
        title="Cursos e mentorias"
        description="Crie rascunhos com módulos e videoaulas. Pacientes só veem conteúdos publicados."
      >
        <Typography variant="body" color={colors.textMuted}>
          Use URL externa de vídeo nesta fase (sem upload para Storage).
        </Typography>
        <Button
          label="Meus cursos"
          onPress={() => router.push('/(profissional)/cursos' as Href)}
        />
      </SectionCard>

      <SectionCard
        title="Pacientes vinculados"
        description="Convide pelo e-mail e acompanhe check-ins em modo leitura após o aceite."
      >
        <Typography variant="body" color={colors.textMuted}>
          O paciente precisa aceitar o convite. Você não edita o diário dele.
        </Typography>
        <Button
          label="Meus pacientes"
          onPress={() => router.push('/(profissional)/pacientes' as Href)}
        />
      </SectionCard>

      <View style={styles.actions}>
        <Button
          label="Abrir perfil"
          variant="outline"
          onPress={() => router.push('/(profissional)/perfil' as Href)}
        />
        <Button
          label="Sair"
          variant="outline"
          loading={loggingOut}
          onPress={handleLogout}
        />
      </View>
    </Container>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: space[5],
    position: 'relative',
  },
  wash: {
    ...StyleSheet.absoluteFill,
    height: '40%',
  },
  actions: {
    zIndex: 1,
    gap: space[3],
  },
});
