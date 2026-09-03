import { Redirect } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import type { ReactNode } from 'react';

import { useAuth } from '@/src/hooks/useAuth';
import { colors } from '@/src/theme';

type AuthGateProps = {
  children: ReactNode;
  requireAuth?: boolean;
};

export function AuthGate({ children, requireAuth = false }: AuthGateProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (requireAuth && !user) {
    return <Redirect href="/login" />;
  }

  if (!requireAuth && user) {
    return <Redirect href="/home" />;
  }

  return children;
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
});
