import * as Linking from 'expo-linking';
import { useLocalSearchParams, useRouter, type Href } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import {
  Button,
  Container,
  InlineMessage,
  ScreenHeader,
  Typography,
} from '@/src/components';
import { articleKindLabel, type ContentArticle } from '@/src/domain/article';
import { getArticleById } from '@/src/services/article.service';
import { colors, radius, space } from '@/src/theme';

export function ArticleDetailScreen() {
  const router = useRouter();
  const { articleId } = useLocalSearchParams<{ articleId: string }>();
  const [article, setArticle] = useState<ContentArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      if (!articleId) {
        setLoading(false);
        setError('Conteúdo não encontrado.');
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const item = await getArticleById(articleId);
        setArticle(item);
        if (!item) {
          setError('Conteúdo não encontrado.');
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Falha ao carregar conteúdo.',
        );
      } finally {
        setLoading(false);
      }
    })();
  }, [articleId]);

  if (loading) {
    return (
      <Container edges={['top', 'left', 'right']} contentStyle={styles.center}>
        <ActivityIndicator color={colors.primary} size="large" />
      </Container>
    );
  }

  if (!article) {
    return (
      <Container edges={['top', 'left', 'right']} contentStyle={styles.content}>
        <InlineMessage message={error ?? 'Conteúdo indisponível.'} variant="error" />
        <Button label="Voltar" variant="outline" onPress={() => router.back()} />
      </Container>
    );
  }

  return (
    <Container
      edges={['top', 'left', 'right']}
      scroll
      contentStyle={styles.content}
    >
      <ScreenHeader
        eyebrow={articleKindLabel(article.kind)}
        title={article.title}
        subtitle={article.summary}
        onBack={() => router.replace('/(paciente)/descobrir' as Href)}
        backLabel="Explorar"
      />

      {error ? <InlineMessage message={error} variant="error" /> : null}

      <View style={styles.panel}>
        <Typography variant="body">{article.body}</Typography>
      </View>

      {article.externalUrl ? (
        <Button
          label="Abrir link externo"
          variant="outline"
          onPress={() => {
            void Linking.openURL(article.externalUrl!);
          }}
        />
      ) : null}

      <InlineMessage
        message="Conteúdo educativo. Não substitui avaliação de um profissional de saúde."
        variant="info"
      />
    </Container>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: space[4],
    paddingBottom: space[8],
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  panel: {
    gap: space[3],
    padding: space[4],
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
});
