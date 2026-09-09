import { useRouter, type Href } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import {
  Button,
  Container,
  InlineMessage,
  Input,
  ScreenHeader,
  SelectableChip,
  SelectableChipGroup,
  Typography,
} from '@/src/components';
import type { ArticleKind } from '@/src/domain/article';
import { useToast } from '@/src/contexts/ToastContext';
import { useAuth } from '@/src/hooks/useAuth';
import { createArticle } from '@/src/services/article.service';
import { space } from '@/src/theme';

export function AdminArticleCreateScreen() {
  const router = useRouter();
  const { showToast } = useToast();
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [body, setBody] = useState('');
  const [kind, setKind] = useState<ArticleKind>('noticia');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const publish = async () => {
    if (!user) {
      return;
    }
    setLoading(true);
    setError('');
    try {
      const created = await createArticle({
        title,
        summary,
        body,
        kind,
        createdBy: user.uid,
        createdByRole: 'admin',
        status: 'published',
      });
      showToast({
        message: `Publicado: ${created.title}`,
        variant: 'success',
      });
      router.replace('/(admin)' as Href);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Falha ao publicar.';
      setError(message);
      showToast({ message, variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container
      edges={['top', 'left', 'right']}
      scroll
      keyboardAvoiding
      contentStyle={styles.content}
    >
      <ScreenHeader
        eyebrow="Publicação"
        title="Novo conteúdo"
        subtitle="Notícia, pesquisa ou artigo singular (sem módulos)."
        onBack={() => router.replace('/(admin)' as Href)}
        backLabel="Início"
      />

      {error ? <InlineMessage message={error} variant="error" /> : null}

      <Input label="Título" value={title} onChangeText={setTitle} />
      <Input label="Resumo" value={summary} onChangeText={setSummary} />
      <Input label="Texto" value={body} onChangeText={setBody} multiline />

      <View style={styles.block}>
        <Typography variant="label">Tipo</Typography>
        <SelectableChipGroup>
          <SelectableChip
            label="Notícia"
            selected={kind === 'noticia'}
            onPress={() => setKind('noticia')}
          />
          <SelectableChip
            label="Pesquisa"
            selected={kind === 'pesquisa'}
            onPress={() => setKind('pesquisa')}
          />
          <SelectableChip
            label="Artigo"
            selected={kind === 'artigo'}
            onPress={() => setKind('artigo')}
          />
        </SelectableChipGroup>
      </View>

      <Button
        label="Publicar agora"
        loading={loading}
        onPress={() => void publish()}
      />
    </Container>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: space[4],
    paddingBottom: space[8],
  },
  block: {
    gap: space[2],
  },
});
