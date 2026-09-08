import { Redirect } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import type { ReactNode } from 'react';

import { Button, Typography } from '@/src/components';
import type { UserRole } from '@/src/domain/user';
import { useAuth } from '@/src/hooks/useAuth';
import { colors, space } from '@/src/theme';
import { getHomeHrefForRole } from '@/src/utils/navigation';

type RoleGateProps = {
  children: ReactNode;
  allowedRole: UserRole;
};

export function RoleGate({ children, allowedRole }: RoleGateProps) {
  const {
    user,
    profile,
    loading,
    profileLoading,
    profileError,
    refreshProfile,
    signOut,
  } = useAuth();

  if (loading || (user && profileLoading && !profile)) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Typography variant="caption" color={colors.textMuted}>
          Carregando…
        </Typography>
      </View>
    );
  }

  if (!user) {
    return <Redirect href="/login" />;
  }

  if (!profile) {
    return (
      <View style={styles.recovery}>
        <Typography variant="h2">Não foi possível carregar seu perfil</Typography>
        <Typography variant="body" color={colors.textMuted}>
          {profileError ??
            'Sua sessão continua ativa, mas o perfil não carregou. Tente novamente ou saia da conta.'}
        </Typography>
        <Button label="Tentar novamente" onPress={() => void refreshProfile()} />
        <Button
          label="Sair da conta"
          variant="outline"
          onPress={() => void signOut()}
        />
      </View>
    );
  }

  if (profile.role !== allowedRole) {
    return <Redirect href={getHomeHrefForRole(profile.role)} />;
  }

  return children;
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: space[3],
    backgroundColor: colors.background,
    paddingHorizontal: space[5],
  },
  recovery: {
    flex: 1,
    justifyContent: 'center',
    gap: space[4],
    backgroundColor: colors.background,
    paddingHorizontal: space[5],
  },
});
