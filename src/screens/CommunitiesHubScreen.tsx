import { Ionicons } from '@expo/vector-icons';
import { useRouter, type Href } from 'expo-router';
import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import {
  Button,
  Container,
  InlineMessage,
  ScreenHeader,
  Typography,
} from '@/src/components';
import { usePublishedCommunities } from '@/src/hooks/usePublishedCommunities';
import { colors, radius, space } from '@/src/theme';

export function CommunitiesHubScreen() {
  const router = useRouter();
  const { communities, loading, error, refresh } = usePublishedCommunities();

  return (
    <Container
      scroll
      edges={['top', 'left', 'right']}
      contentStyle={styles.content}
    >
      <ScreenHeader
        eyebrow="Conexão"
        title="Comunidade"
        subtitle="Participe de grupos publicados pelo app. Moderação avançada virá depois."
      />

      {error ? <InlineMessage message={error} variant="error" /> : null}

      <InlineMessage
        message="Somente comunidades aprovadas aparecem aqui. Profissionais podem solicitar novas; admin publica ou aprova."
        variant="info"
      />

      {loading && communities.length === 0 ? (
        <ActivityIndicator color={colors.primary} />
      ) : null}

      {!loading && communities.length === 0 ? (
        <InlineMessage
          message="Nenhuma comunidade publicada ainda. Volte em breve."
          variant="info"
        />
      ) : null}

      {communities.map((item) => (
        <Pressable
          key={item.id}
          style={({ pressed }) => [
            styles.card,
            pressed ? styles.cardPressed : null,
          ]}
          onPress={() =>
            router.push(`/(paciente)/comunidade/${item.id}` as Href)
          }
          accessibilityRole="button"
        >
          <Typography variant="h3">{item.title}</Typography>
          <Typography variant="body" color={colors.textMuted} numberOfLines={3}>
            {item.description}
          </Typography>
          <View style={styles.row}>
            <Typography variant="caption" color={colors.primary}>
              {item.memberCount} membro(s)
            </Typography>
            <Ionicons
              name="chevron-forward"
              size={18}
              color={colors.textMuted}
            />
          </View>
        </Pressable>
      ))}

      <Button label="Atualizar lista" variant="outline" onPress={refresh} />
    </Container>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: space[4],
    paddingBottom: space[8],
  },
  card: {
    gap: space[2],
    padding: space[4],
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardPressed: {
    backgroundColor: colors.backgroundAccent,
  },
  row: {
    marginTop: space[1],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
