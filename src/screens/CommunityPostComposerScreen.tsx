import { useLocalSearchParams, type Href } from 'expo-router';
import React from 'react';
import { StyleSheet, TextInput } from 'react-native';

import {
  Button,
  Container,
  InlineMessage,
  ScreenHeader,
  Typography,
} from '@/src/components';
import { useCommunityPostComposer } from '@/src/hooks/useCommunityPostComposer';
import { colors, radius, space } from '@/src/theme';
import { goBackOrReplace } from '@/src/utils/navigationBack';
import { firstParam } from '@/src/utils/routeParams';

export function CommunityPostComposerScreen() {
  const params = useLocalSearchParams<{ communityId?: string | string[] }>();
  const communityId = firstParam(params.communityId);
  const {
    title,
    setTitle,
    summary,
    setSummary,
    body,
    setBody,
    imageUrl,
    setImageUrl,
    saving,
    error,
    submit,
  } = useCommunityPostComposer(communityId);

  const handleSubmit = async () => {
    const post = await submit();
    if (post && communityId) {
      goBackOrReplace(
        `/(paciente)/comunidade/${communityId}/posts/${post.id}` as Href,
      );
    }
  };

  return (
    <Container
      scroll
      keyboardAvoiding
      edges={['top', 'left', 'right']}
      contentStyle={styles.content}
    >
      <ScreenHeader
        title="Nova publicação"
        subtitle="Título, resumo e conteúdo. Imagem opcional via URL."
        compact
        onBack={() =>
          goBackOrReplace(`/(paciente)/comunidade/${communityId}` as Href)
        }
        backLabel="Voltar ao grupo"
      />

      {error ? <InlineMessage message={error} variant="error" /> : null}

      <Typography variant="label">Título</Typography>
      <TextInput
        value={title}
        onChangeText={setTitle}
        placeholder="Ex.: Minha rotina de compressão"
        placeholderTextColor={colors.textMuted}
        style={styles.input}
        maxLength={80}
      />

      <Typography variant="label">Resumo</Typography>
      <TextInput
        value={summary}
        onChangeText={setSummary}
        placeholder="Aparece no card do feed (até ~160 caracteres)"
        placeholderTextColor={colors.textMuted}
        style={[styles.input, styles.areaShort]}
        multiline
        maxLength={160}
      />

      <Typography variant="label">Conteúdo completo</Typography>
      <TextInput
        value={body}
        onChangeText={setBody}
        placeholder="Escreva a publicação completa…"
        placeholderTextColor={colors.textMuted}
        style={[styles.input, styles.area]}
        multiline
      />

      <Typography variant="label">URL da imagem (opcional)</Typography>
      <TextInput
        value={imageUrl}
        onChangeText={setImageUrl}
        placeholder="https://…"
        placeholderTextColor={colors.textMuted}
        style={styles.input}
        autoCapitalize="none"
        autoCorrect={false}
      />

      <Button
        label="Publicar"
        loading={saving}
        onPress={() => void handleSubmit()}
      />
    </Container>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: space[3],
    paddingBottom: space[8],
  },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: space[3],
    color: colors.text,
    backgroundColor: colors.surface,
    fontFamily: 'SourceSans3_400Regular',
    fontSize: 16,
  },
  areaShort: {
    minHeight: 72,
    padding: space[3],
    textAlignVertical: 'top',
  },
  area: {
    minHeight: 160,
    padding: space[3],
    textAlignVertical: 'top',
  },
});
