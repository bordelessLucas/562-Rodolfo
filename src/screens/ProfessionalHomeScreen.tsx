import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter, type Href } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import {
  Button,
  Container,
  InlineMessage,
  ScreenHeader,
  Typography,
} from '@/src/components';
import { useAuth } from '@/src/hooks/useAuth';
import { useProfessionalHomeStats } from '@/src/hooks/useProfessionalHomeStats';
import { colors, radius, space } from '@/src/theme';

type QuickStatProps = {
  label: string;
  value: number;
  hint?: string;
};

function QuickStat({ label, value, hint }: QuickStatProps) {
  return (
    <View style={styles.stat}>
      <Typography variant="h2" color={colors.primary}>
        {value}
      </Typography>
      <Typography variant="caption" color={colors.textMuted}>
        {label}
      </Typography>
      {hint ? (
        <Typography variant="caption" color={colors.secondary}>
          {hint}
        </Typography>
      ) : null}
    </View>
  );
}

type NavRowProps = {
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
};

function NavRow({ title, subtitle, icon, onPress }: NavRowProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      onPress={onPress}
      style={({ pressed }) => [styles.navRow, pressed ? styles.navPressed : null]}
    >
      <View style={styles.navIcon}>
        <Ionicons name={icon} size={22} color={colors.primary} />
      </View>
      <View style={styles.navText}>
        <Typography variant="h3">{title}</Typography>
        <Typography variant="caption" color={colors.textMuted}>
          {subtitle}
        </Typography>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
    </Pressable>
  );
}

export function ProfessionalHomeScreen() {
  const router = useRouter();
  const { profile, user, signOut } = useAuth();
  const { stats, loading, error, refresh } = useProfessionalHomeStats(
    user?.uid,
  );
  const [loggingOut, setLoggingOut] = useState(false);

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await signOut();
      router.replace('/login');
    } finally {
      setLoggingOut(false);
    }
  };

  const firstName = profile?.name?.split(' ')[0] ?? 'profissional';
  const pendingCoursesHint =
    stats.coursesPendingReview > 0
      ? `${stats.coursesPendingReview} em revisão`
      : undefined;
  const pendingInviteHint =
    stats.pendingInvites > 0
      ? `${stats.pendingInvites} convite(s) pendente(s)`
      : undefined;

  return (
    <Container scroll contentStyle={styles.content}>
      <LinearGradient
        colors={[colors.backgroundAccent, colors.background]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.wash}
      />

      <ScreenHeader
        eyebrow="Área profissional"
        title={`Olá, ${firstName}`}
        subtitle="Pacientes vinculados, conteúdos educativos e pedidos de comunidade."
      />

      {error ? <InlineMessage message={error} variant="error" /> : null}

      <View style={styles.statsCard}>
        {loading ? (
          <View style={styles.statsLoading}>
            <ActivityIndicator color={colors.primary} />
            <Typography variant="caption" color={colors.textMuted}>
              Atualizando resumo…
            </Typography>
          </View>
        ) : (
          <View style={styles.statsRow}>
            <QuickStat
              label="Pacientes"
              value={stats.activePatients}
              hint={pendingInviteHint}
            />
            <View style={styles.statDivider} />
            <QuickStat
              label="Cursos publicados"
              value={stats.coursesPublished}
              hint={pendingCoursesHint}
            />
            <View style={styles.statDivider} />
            <QuickStat
              label="Comunidades"
              value={stats.communitiesPublished}
              hint={
                stats.communitiesPending > 0
                  ? `${stats.communitiesPending} aguardando`
                  : undefined
              }
            />
          </View>
        )}
      </View>

      <View style={styles.navBlock}>
        <NavRow
          title="Meus pacientes"
          subtitle="Convidar por e-mail e ver check-ins em leitura."
          icon="people-outline"
          onPress={() => router.push('/(profissional)/pacientes' as Href)}
        />
        <NavRow
          title="Meus cursos"
          subtitle="Rascunhos com link externo de vídeo · aprovação do admin."
          icon="play-circle-outline"
          onPress={() => router.push('/(profissional)/cursos' as Href)}
        />
        <NavRow
          title="Comunidades"
          subtitle="Solicitar grupo temático e acompanhar o status."
          icon="chatbubbles-outline"
          onPress={() => router.push('/(profissional)/comunidades' as Href)}
        />
      </View>

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
          onPress={() => void handleLogout()}
        />
      </View>
    </Container>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: space[5],
    position: 'relative',
    paddingBottom: space[8],
  },
  wash: {
    ...StyleSheet.absoluteFill,
    height: '36%',
  },
  statsCard: {
    zIndex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: space[4],
    paddingHorizontal: space[3],
  },
  statsLoading: {
    alignItems: 'center',
    gap: space[2],
    paddingVertical: space[3],
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  stat: {
    flex: 1,
    alignItems: 'center',
    gap: space[1],
    paddingHorizontal: space[1],
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.border,
  },
  navBlock: {
    zIndex: 1,
    gap: space[3],
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
    padding: space[4],
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  navPressed: {
    backgroundColor: colors.backgroundAccent,
  },
  navIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.backgroundAccent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navText: {
    flex: 1,
    gap: space[1],
  },
  actions: {
    zIndex: 1,
    gap: space[3],
  },
});
