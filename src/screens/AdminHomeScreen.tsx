import { Ionicons } from '@expo/vector-icons';
import { useRouter, type Href } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';

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
import { listPendingCommunities } from '@/src/services/community.service';
import { listCoursesByStatus } from '@/src/services/course.service';
import { colors, radius, space } from '@/src/theme';

function mapPermissionError(err: unknown, fallback: string): string {
  const code =
    typeof err === 'object' &&
    err !== null &&
    'code' in err &&
    typeof (err as { code: unknown }).code === 'string'
      ? (err as { code: string }).code
      : '';
  if (code === 'permission-denied') {
    return 'Sem permissão para esta ação. Confirme que a conta é admin e tente novamente.';
  }
  if (code === 'failed-precondition') {
    return 'Índice do Firestore ainda em construção. Aguarde alguns minutos e atualize.';
  }
  return err instanceof Error ? err.message : fallback;
}

type NavCardProps = {
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  badge?: string;
};

function NavCard({ title, description, icon, onPress, badge }: NavCardProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.navCard, pressed ? styles.navPressed : null]}
    >
      <View style={styles.navIcon}>
        <Ionicons name={icon} size={22} color={colors.primary} />
      </View>
      <View style={styles.navText}>
        <View style={styles.navTitleRow}>
          <Typography variant="h3">{title}</Typography>
          {badge ? (
            <View style={styles.badge}>
              <Typography variant="caption" color={colors.textOnPrimary}>
                {badge}
              </Typography>
            </View>
          ) : null}
        </View>
        <Typography variant="body" color={colors.textMuted} numberOfLines={2}>
          {description}
        </Typography>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
    </Pressable>
  );
}

export function AdminHomeScreen() {
  const router = useRouter();
  const { profile, user, signOut } = useAuth();
  const { seeding, seedMessage, seedError, runSeed } = useAdminSeed();
  const [loggingOut, setLoggingOut] = useState(false);
  const [pendingCourses, setPendingCourses] = useState(0);
  const [pendingCommunities, setPendingCommunities] = useState(0);
  const [countsLoading, setCountsLoading] = useState(true);
  const [countsError, setCountsError] = useState('');

  const refreshCounts = useCallback(async () => {
    if (!user || profile?.role !== 'admin') {
      setCountsLoading(false);
      return;
    }
    setCountsLoading(true);
    setCountsError('');
    try {
      const [courses, communities] = await Promise.all([
        listCoursesByStatus('pending_review'),
        listPendingCommunities(),
      ]);
      setPendingCourses(courses.length);
      setPendingCommunities(communities.length);
    } catch (err) {
      setCountsError(
        mapPermissionError(err, 'Não foi possível carregar os resumos da fila.'),
      );
      setPendingCourses(0);
      setPendingCommunities(0);
    } finally {
      setCountsLoading(false);
    }
  }, [user, profile?.role]);

  useEffect(() => {
    void refreshCounts();
  }, [refreshCounts]);

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
    await refreshCounts();
  };

  return (
    <Container scroll contentStyle={styles.content}>
      <ScreenHeader
        eyebrow="Administração"
        title={`Olá, ${profile?.name?.split(' ')[0] ?? 'admin'}`}
        subtitle="Modere submissões e publique conteúdos para o app."
      />

      {countsError ? (
        <InlineMessage message={countsError} variant="error" />
      ) : null}
      {seedError ? <InlineMessage message={seedError} variant="error" /> : null}
      {seedMessage ? (
        <InlineMessage message={seedMessage} variant="success" />
      ) : null}

      <SectionCard
        title="Moderação"
        description="Itens enviados por profissionais aguardando sua decisão."
      >
        {countsLoading ? (
          <ActivityIndicator color={colors.primary} />
        ) : (
          <View style={styles.navStack}>
            <NavCard
              title="Fila de cursos"
              description="Aprovar ou recusar cursos e mentorias."
              icon="school-outline"
              badge={pendingCourses > 0 ? String(pendingCourses) : undefined}
              onPress={() => router.push('/(admin)/revisao' as Href)}
            />
            <NavCard
              title="Fila de comunidades"
              description="Aprovar pedidos de novas comunidades."
              icon="people-outline"
              badge={
                pendingCommunities > 0 ? String(pendingCommunities) : undefined
              }
              onPress={() =>
                router.push('/(admin)/comunidades/revisao' as Href)
              }
            />
          </View>
        )}
        <Button
          label="Atualizar filas"
          variant="outline"
          onPress={() => void refreshCounts()}
        />
      </SectionCard>

      <SectionCard
        title="Publicar conteúdo"
        description="Crie e publique direto, sem passar pela fila."
      >
        <View style={styles.navStack}>
          <NavCard
            title="Novo curso"
            description="Criar e publicar curso ou mentoria."
            icon="add-circle-outline"
            onPress={() => router.push('/(admin)/cursos/novo' as Href)}
          />
          <NavCard
            title="Notícia ou artigo"
            description="Publicar notícia, pesquisa ou artigo."
            icon="newspaper-outline"
            onPress={() => router.push('/(admin)/artigos/novo' as Href)}
          />
          <NavCard
            title="Nova comunidade"
            description="Criar comunidade já publicada no app."
            icon="chatbubbles-outline"
            onPress={() => router.push('/(admin)/comunidades/novo' as Href)}
          />
        </View>
      </SectionCard>

      <SectionCard
        title="Demonstração"
        description="Carrega cursos, artigos e comunidades de exemplo."
      >
        <Button
          label="Carregar conteúdos de demonstração"
          variant="secondary"
          loading={seeding}
          onPress={() => void handleSeed()}
        />
      </SectionCard>

      <SectionCard title="Conta">
        <View style={styles.accountActions}>
          <Button
            label="Perfil"
            variant="outline"
            onPress={() => router.push('/(admin)/perfil' as Href)}
          />
          <Button
            label="Sair"
            variant="outline"
            loading={loggingOut}
            onPress={() => void handleLogout()}
          />
        </View>
      </SectionCard>
    </Container>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: space[4],
    paddingBottom: space[8],
  },
  navStack: {
    gap: space[3],
  },
  navCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
    padding: space[4],
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  navPressed: {
    backgroundColor: colors.backgroundAccent,
  },
  navIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.backgroundAccent,
  },
  navText: {
    flex: 1,
    gap: 2,
  },
  navTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[2],
  },
  badge: {
    minWidth: 22,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.sm,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  accountActions: {
    gap: space[3],
  },
});
