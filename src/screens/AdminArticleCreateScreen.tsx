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
import { useAuth } from '@/src/hooks/useAuth';
import { createArticle } from '@/src/services/article.service';
import { colors, space } from '@/src/theme';

export function AdminArticleCreateScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [body, setBody] = useState('');
  const [kind, setKind] = useState<ArticleKind>('noticia');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const publish = async () => {
    if (!user) {
      return;
    }
    setLoading(true);
    setError('');
    setMessage('');
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
      setMessage(`Publicado: ${created.title}`);
      setTitle('');
      setSummary('');
      setBody('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao publicar.');
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
        onBack={() => router.back()}
      />

      {error ? <InlineMessage message={error} variant="error" /> : null}
      {message ? <InlineMessage message={message} variant="success" /> : null}

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

      <Button label="Publicar agora" loading={loading} onPress={publish} />
      <Button
        label="Voltar"
        variant="outline"
        onPress={() => router.replace('/(admin)' as Href)}
      />
    </Container>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: space[4],
  },
  block: {
    gap: space[2],
  },
});
