import { useRouter, type Href } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import {
  Button,
  Container,
  InlineMessage,
  ScreenHeader,
  SectionCard,
  Typography,
} from '@/src/components';
import { useAuth } from '@/src/hooks/useAuth';
import { useAdminSeed } from '@/src/hooks/useAdminSeed';
import { usePendingCourses } from '@/src/hooks/usePendingCourses';
import { colors, space } from '@/src/theme';

export function AdminHomeScreen() {
  const router = useRouter();
  const { profile, signOut } = useAuth();
  const { courses, loading, error, refresh } = usePendingCourses();
  const { seeding, seedMessage, seedError, runSeed } = useAdminSeed();
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

  const handleSeed = async () => {
    await runSeed();
    await refresh();
  };

  return (
    <Container scroll contentStyle={styles.content}>
      <ScreenHeader
        eyebrow="Administração"
        title={`Olá, ${profile?.name?.split(' ')[0] ?? 'admin'}`}
        subtitle="Publique cursos e aprove submissões de profissionais."
      />

      {error ? <InlineMessage message={error} variant="error" /> : null}
      {seedError ? <InlineMessage message={seedError} variant="error" /> : null}
      {seedMessage ? (
        <InlineMessage message={seedMessage} variant="success" />
      ) : null}

      <SectionCard
        title="Fila de revisão"
        description={
          loading
            ? 'Carregando submissões…'
            : `${courses.length} curso(s) aguardando aprovação.`
        }
      >
        {loading ? <ActivityIndicator color={colors.primary} /> : null}
        <Button
          label="Abrir fila de aprovação"
          onPress={() => router.push('/(admin)/revisao' as Href)}
        />
      </SectionCard>

      <View style={styles.actions}>
        <Button
          label="Criar e publicar curso"
          variant="secondary"
          onPress={() => router.push('/(admin)/cursos/novo' as Href)}
        />
        <Button
          label="Publicar notícia ou artigo"
          variant="secondary"
          onPress={() => router.push('/(admin)/artigos/novo' as Href)}
        />
        <Button
          label="Carregar conteúdos de demonstração"
          variant="outline"
          loading={seeding}
          onPress={handleSeed}
        />
        <Button
          label="Perfil"
          variant="outline"
          onPress={() => router.push('/(admin)/perfil' as Href)}
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
    gap: space[4],
    paddingBottom: space[8],
  },
  actions: {
    gap: space[3],
  },
});
