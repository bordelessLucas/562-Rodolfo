import { Redirect } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import type { ReactNode } from 'react';

import { Typography } from '@/src/components';
import type { UserRole } from '@/src/domain/user';
import { useAuth } from '@/src/hooks/useAuth';
import { colors, space } from '@/src/theme';
import { getHomeHrefForRole } from '@/src/utils/navigation';

type RoleGateProps = {
  children: ReactNode;
  allowedRole: UserRole;
};

export function RoleGate({ children, allowedRole }: RoleGateProps) {
  const { user, profile, loading, profileLoading } = useAuth();

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
    return <Redirect href="/login" />;
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
  },
});
