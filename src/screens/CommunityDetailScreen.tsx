import { useLocalSearchParams, useRouter, type Href } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, TextInput, View } from 'react-native';

import {
  Button,
  Container,
  InlineMessage,
  ScreenHeader,
  SectionCard,
  Typography,
} from '@/src/components';
import { useCommunityDetail } from '@/src/hooks/useCommunityDetail';
import { colors, radius, space } from '@/src/theme';
import { firstParam } from '@/src/utils/routeParams';

export function CommunityDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ communityId?: string | string[] }>();
  const communityId = firstParam(params.communityId);
  const {
    community,
    isMember,
    posts,
    commentsByPost,
    loading,
    posting,
    joining,
    error,
    message,
    join,
    leave,
    publishPost,
    publishComment,
  } = useCommunityDetail(communityId);

  const [draft, setDraft] = useState('');
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>(
    {},
  );

  if (!communityId) {
    return (
      <Container contentStyle={styles.content}>
        <InlineMessage message="Comunidade inválida." variant="error" />
        <Button
          label="Voltar"
          onPress={() => router.replace('/(paciente)/comunidade' as Href)}
        />
      </Container>
    );
  }

  return (
    <Container
      scroll
      keyboardAvoiding
      edges={['top', 'left', 'right']}
      contentStyle={styles.content}
    >
      <ScreenHeader
        eyebrow="Comunidade"
        title={community?.title ?? 'Carregando…'}
        subtitle={community?.description}
        onBack={() => router.replace('/(paciente)/comunidade' as Href)}
        backLabel="Comunidades"
      />

      {error ? <InlineMessage message={error} variant="error" /> : null}
      {message ? <InlineMessage message={message} variant="success" /> : null}

      {loading && !community ? (
        <ActivityIndicator color={colors.primary} />
      ) : null}

      {community ? (
        <SectionCard
          title="Participação"
          description={`${community.memberCount} membro(s) · interação básica (posts e comentários).`}
        >
          {isMember ? (
            <Button
              label="Sair da comunidade"
              variant="outline"
              loading={joining}
              onPress={leave}
            />
          ) : (
            <Button
              label="Entrar na comunidade"
              loading={joining}
              onPress={join}
            />
          )}
        </SectionCard>
      ) : null}

      {isMember ? (
        <SectionCard title="Nova publicação">
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder="Compartilhe algo com o grupo…"
            placeholderTextColor={colors.textMuted}
            multiline
            style={styles.input}
          />
          <Button
            label="Publicar"
            loading={posting}
            onPress={async () => {
              await publishPost(draft);
              setDraft('');
            }}
          />
        </SectionCard>
      ) : (
        <InlineMessage
          message="Entre na comunidade para publicar e comentar."
          variant="info"
        />
      )}

      {posts.map((post) => (
        <SectionCard
          key={post.id}
          title={post.authorName}
          description={post.createdAt.toLocaleString('pt-BR')}
        >
          <Typography variant="body">{post.body}</Typography>

          <View style={styles.comments}>
            <Typography variant="label">Comentários</Typography>
            {(commentsByPost[post.id] ?? []).map((comment) => (
              <View key={comment.id} style={styles.comment}>
                <Typography variant="caption" color={colors.primary}>
                  {comment.authorName}
                </Typography>
                <Typography variant="body">{comment.body}</Typography>
              </View>
            ))}
            {isMember ? (
              <>
                <TextInput
                  value={commentDrafts[post.id] ?? ''}
                  onChangeText={(text) =>
                    setCommentDrafts((prev) => ({ ...prev, [post.id]: text }))
                  }
                  placeholder="Escrever comentário…"
                  placeholderTextColor={colors.textMuted}
                  style={styles.commentInput}
                />
                <Button
                  label="Comentar"
                  variant="outline"
                  onPress={async () => {
                    await publishComment(post.id, commentDrafts[post.id] ?? '');
                    setCommentDrafts((prev) => ({ ...prev, [post.id]: '' }));
                  }}
                />
              </>
            ) : null}
          </View>
        </SectionCard>
      ))}

      {!loading && posts.length === 0 && isMember ? (
        <InlineMessage
          message="Ainda não há publicações. Seja a primeira pessoa a escrever."
          variant="info"
        />
      ) : null}
    </Container>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: space[4],
    paddingBottom: space[8],
  },
  input: {
    minHeight: 100,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: space[4],
    textAlignVertical: 'top',
    color: colors.text,
    backgroundColor: colors.background,
    fontFamily: 'SourceSans3_400Regular',
    fontSize: 16,
  },
  comments: {
    gap: space[2],
    marginTop: space[2],
  },
  comment: {
    gap: 2,
    padding: space[3],
    borderRadius: radius.md,
    backgroundColor: colors.backgroundAccent,
  },
  commentInput: {
    minHeight: 44,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: space[3],
    color: colors.text,
    backgroundColor: colors.background,
    fontFamily: 'SourceSans3_400Regular',
  },
});
