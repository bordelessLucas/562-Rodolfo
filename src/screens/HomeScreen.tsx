import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Container, Typography } from '@/src/components';
import { useAuth } from '@/src/hooks/useAuth';
import { colors, radius, space } from '@/src/theme';

const NAV_ITEMS = [
  { key: 'home', label: 'Início', icon: 'home-outline' as const },
  { key: 'diary', label: 'Diário', icon: 'book-outline' as const },
  { key: 'profile', label: 'Perfil', icon: 'person-outline' as const },
];

export function HomeScreen() {
  const router = useRouter();
  const { profile, signOut } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);

  const userName = profile?.name?.split(' ')[0] ?? 'usuário';
  const roleLabel =
    profile?.role === 'profissional' ? 'profissional de saúde' : 'paciente';

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await signOut();
      router.replace('/login');
    } finally {
      setLoggingOut(false);
    }
  };

  const handleNavPress = (_key: string) => {};

  return (
    <Container
      edges={['top', 'left', 'right']}
      contentStyle={styles.content}
      style={styles.screen}
    >
      <View style={styles.header}>
        <View style={styles.brandRow}>
          <Typography variant="h2">Lipedema</Typography>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Sair"
            onPress={handleLogout}
            disabled={loggingOut}
            hitSlop={8}
            style={styles.logoutButton}
          >
            <Ionicons name="log-out-outline" size={22} color={colors.primary} />
          </Pressable>
        </View>

        <View style={styles.navBar}>
          {NAV_ITEMS.map((item) => (
            <Pressable
              key={item.key}
              accessibilityRole="button"
              accessibilityLabel={item.label}
              onPress={() => handleNavPress(item.key)}
              style={[styles.navItem, item.key === 'home' && styles.navItemActive]}
            >
              <Ionicons
                name={item.icon}
                size={18}
                color={item.key === 'home' ? colors.primary : colors.textMuted}
              />
              <Typography
                variant="caption"
                color={item.key === 'home' ? colors.primary : colors.textMuted}
              >
                {item.label}
              </Typography>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.greeting}>
        <Typography variant="h1">Olá, {userName}</Typography>
        <Typography variant="body" color={colors.textMuted}>
          Conta de {roleLabel}. Seu espaço de acompanhamento. Em breve: diário e
          ficha de diagnóstico.
        </Typography>
      </View>

      <View style={styles.skeletonStack}>
        <SkeletonBlock
          title="Diário de Lipedema"
          description="Registros e histórico aparecerão aqui."
          icon="journal-outline"
        />
        <SkeletonBlock
          title="Ficha de diagnóstico"
          description="Resumo da ficha preenchida (estrutura a confirmar)."
          icon="clipboard-outline"
        />
        <SkeletonBlock
          title="Conteúdos"
          description="Mentoria e materiais — integração pendente."
          icon="library-outline"
        />
      </View>
    </Container>
  );
}

type SkeletonBlockProps = {
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
};

function SkeletonBlock({ title, description, icon }: SkeletonBlockProps) {
  return (
    <View style={styles.skeleton}>
      <View style={styles.skeletonIcon}>
        <Ionicons name={icon} size={22} color={colors.secondary} />
      </View>
      <View style={styles.skeletonText}>
        <Typography variant="h3">{title}</Typography>
        <Typography variant="caption" color={colors.textMuted}>
          {description}
        </Typography>
        <View style={styles.skeletonBar} />
        <View style={[styles.skeletonBar, styles.skeletonBarShort]} />
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
    gap: space[4],
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logoutButton: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.backgroundAccent,
  },
  navBar: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: space[1],
    gap: space[1],
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: space[1],
    paddingVertical: space[2],
    borderRadius: radius.sm,
  },
  navItemActive: {
    backgroundColor: colors.backgroundAccent,
  },
  greeting: {
    gap: space[2],
  },
  skeletonStack: {
    gap: space[4],
  },
  skeleton: {
    flexDirection: 'row',
    gap: space[4],
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: space[5],
  },
  skeletonIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.sm,
    backgroundColor: colors.backgroundAccent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skeletonText: {
    flex: 1,
    gap: space[2],
  },
  skeletonBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.backgroundAccent,
    marginTop: space[1],
  },
  skeletonBarShort: {
    width: '62%',
  },
});
