import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
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
  Typography,
} from '@/src/components';
import { useAuth } from '@/src/hooks/useAuth';
import { colors, radius, space } from '@/src/theme';

export function HomeScreen() {
  const router = useRouter();
  const {
    profile,
    profileLoading,
    profileError,
    refreshProfile,
    signOut,
  } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const userName = profile?.name?.split(' ')[0] ?? 'usuário';
  const roleLabel =
    profile?.role === 'profissional'
      ? 'Profissional de saúde'
      : profile?.role === 'paciente'
        ? 'Paciente'
        : 'Conta';

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await signOut();
      router.replace('/login');
    } finally {
      setLoggingOut(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshProfile();
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <Container
      edges={['top', 'left', 'right']}
      contentStyle={styles.content}
      style={styles.screen}
    >
      <View style={styles.header}>
        <View>
          <Typography variant="caption" color={colors.secondary}>
            Lipedema
          </Typography>
          <Typography variant="h2">Início</Typography>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Sair da conta"
          onPress={handleLogout}
          disabled={loggingOut}
          hitSlop={8}
          style={styles.logoutButton}
        >
          {loggingOut ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Ionicons name="log-out-outline" size={22} color={colors.primary} />
          )}
        </Pressable>
      </View>

      {profileLoading && !profile ? (
        <View style={styles.loadingBlock}>
          <ActivityIndicator color={colors.primary} />
          <Typography variant="caption" color={colors.textMuted}>
            Carregando seu perfil…
          </Typography>
        </View>
      ) : null}

      {profileError ? (
        <View style={styles.errorBlock}>
          <InlineMessage message={profileError} variant="error" />
          <Button
            label="Tentar novamente"
            variant="outline"
            loading={refreshing}
            onPress={handleRefresh}
          />
        </View>
      ) : null}

      {profile ? (
        <View style={styles.greetingCard}>
          <Typography variant="h1">Olá, {userName}</Typography>
          <View style={styles.roleBadge}>
            <Typography variant="caption" color={colors.primary}>
              {roleLabel}
            </Typography>
          </View>
          <Typography variant="body" color={colors.textMuted}>
            Sua conta está ativa. Em breve você registrará o check-in diário
            aqui.
          </Typography>
        </View>
      ) : null}

      <View style={styles.soonStack}>
        <SoonCard
          icon="calendar-outline"
          title="Check-in diário"
          description="Tratamentos, bem-estar, medidas e observações — em desenvolvimento."
        />
        <SoonCard
          icon="time-outline"
          title="Histórico e tendências"
          description="Acompanhar evolução ao longo dos dias — em breve."
        />
        <SoonCard
          icon="sparkles-outline"
          title="Análise com IA"
          description="Insights com base nos seus registros — sem diagnóstico."
        />
      </View>
    </Container>
  );
}

type SoonCardProps = {
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
};

function SoonCard({ title, description, icon }: SoonCardProps) {
  return (
    <View style={styles.soonCard}>
      <View style={styles.soonIcon}>
        <Ionicons name={icon} size={22} color={colors.secondary} />
      </View>
      <View style={styles.soonText}>
        <Typography variant="h3">{title}</Typography>
        <Typography variant="caption" color={colors.textMuted}>
          {description}
        </Typography>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.background,
  },
  content: {
    gap: space[5],
    paddingBottom: space[8],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logoutButton: {
    width: 44,
    height: 44,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.backgroundAccent,
  },
  loadingBlock: {
    alignItems: 'center',
    gap: space[2],
    paddingVertical: space[4],
  },
  errorBlock: {
    gap: space[3],
  },
  greetingCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: space[6],
    gap: space[3],
  },
  roleBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.backgroundAccent,
    paddingHorizontal: space[3],
    paddingVertical: space[1],
    borderRadius: radius.sm,
  },
  soonStack: {
    gap: space[3],
  },
  soonCard: {
    flexDirection: 'row',
    gap: space[4],
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: space[5],
  },
  soonIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.sm,
    backgroundColor: colors.backgroundAccent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  soonText: {
    flex: 1,
    gap: space[1],
  },
});
