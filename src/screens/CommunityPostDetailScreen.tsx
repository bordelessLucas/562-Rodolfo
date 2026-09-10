import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, type Href } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import {
  Button,
  CommentThread,
  Container,
  InlineMessage,
  ScreenHeader,
  Typography,
} from '@/src/components';
import { useCommunityPostDetail } from '@/src/hooks/useCommunityPostDetail';
import { colors, radius, space } from '@/src/theme';
import { goBackOrReplace } from '@/src/utils/navigationBack';
import { firstParam } from '@/src/utils/routeParams';

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return '?';
  }
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase();
}

export function CommunityPostDetailScreen() {
  const params = useLocalSearchParams<{
    communityId?: string | string[];
    postId?: string | string[];
  }>();
  const communityId = firstParam(params.communityId);
  const postId = firstParam(params.postId);
  const {
    post,
    comments,
    liked,
    canComment,
    loading,
    busy,
    error,
    replyToId,
    setReplyToId,
    toggleLike,
    publishComment,
  } = useCommunityPostDetail(communityId, postId);

  const [draft, setDraft] = useState('');

  return (
    <Container
      scroll
      keyboardAvoiding
      edges={['top', 'left', 'right']}
      contentStyle={styles.content}
    >
      <ScreenHeader
        title={post?.title ?? 'Publicação'}
        compact
        onBack={() =>
          goBackOrReplace(`/(paciente)/comunidade/${communityId}` as Href)
        }
        backLabel="Voltar ao grupo"
      />

      {error ? <InlineMessage message={error} variant="error" /> : null}

      {loading && !post ? (
        <ActivityIndicator color={colors.primary} />
      ) : null}

      {post ? (
        <View style={styles.article}>
          <View style={styles.authorRow}>
            <View style={styles.avatar}>
              <Typography variant="caption" color={colors.primary}>
                {initials(post.authorName)}
              </Typography>
            </View>
            <View style={styles.authorText}>
              <Typography variant="bodyStrong">{post.authorName}</Typography>
              <Typography variant="caption" color={colors.textMuted}>
                {post.createdAt.toLocaleString('pt-BR')}
              </Typography>
            </View>
          </View>

          <Typography variant="h2">{post.title}</Typography>
          {post.imageUrl ? (
            <Image
              source={{ uri: post.imageUrl }}
              style={styles.image}
              contentFit="cover"
              transition={250}
            />
          ) : null}
          <Typography variant="body">{post.body}</Typography>

          <View style={styles.actions}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={liked ? 'Remover curtida' : 'Curtir'}
              onPress={() => void toggleLike()}
              disabled={busy}
              style={({ pressed }) => [
                styles.actionBtn,
                liked ? styles.likeActive : null,
                pressed ? styles.pressed : null,
              ]}
            >
              <Ionicons
                name={liked ? 'heart' : 'heart-outline'}
                size={20}
                color={liked ? colors.error : colors.textMuted}
              />
              <Typography
                variant="caption"
                color={liked ? colors.error : colors.textMuted}
              >
                {post.likeCount} curtidas
              </Typography>
            </Pressable>
            <View style={styles.actionBtn}>
              <Ionicons
                name="chatbubble-outline"
                size={19}
                color={colors.textMuted}
              />
              <Typography variant="caption" color={colors.textMuted}>
                {post.commentCount} comentários
              </Typography>
            </View>
          </View>
        </View>
      ) : null}

      <View style={styles.comments}>
        <Typography variant="h3">Comentários</Typography>
        <CommentThread
          comments={comments}
          canReply={canComment}
          activeReplyId={replyToId}
          onReply={(parentId) => setReplyToId(parentId)}
        />

        {canComment ? (
          <View style={styles.composer}>
            {replyToId ? (
              <View style={styles.replyHint}>
                <Typography variant="caption" color={colors.textMuted}>
                  Respondendo na thread
                </Typography>
                <Pressable onPress={() => setReplyToId(null)} hitSlop={8}>
                  <Typography variant="caption" color={colors.primary}>
                    Cancelar
                  </Typography>
                </Pressable>
              </View>
            ) : null}
            <TextInput
              value={draft}
              onChangeText={setDraft}
              placeholder={
                replyToId
                  ? 'Escreva sua resposta…'
                  : 'Adicione um comentário…'
              }
              placeholderTextColor={colors.textMuted}
              style={styles.input}
              multiline
            />
            <Button
              label={replyToId ? 'Publicar resposta' : 'Comentar'}
              loading={busy}
              onPress={async () => {
                await publishComment(draft);
                setDraft('');
              }}
            />
          </View>
        ) : (
          <InlineMessage
            message="Comentários limitados pela política deste grupo."
            variant="info"
          />
        )}
      </View>
    </Container>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: space[4],
    paddingBottom: space[8],
  },
  article: {
    gap: space[3],
    padding: space[4],
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.backgroundAccent,
  },
  authorText: {
    flex: 1,
    gap: 2,
  },
  image: {
    width: '100%',
    height: 220,
    borderRadius: radius.md,
    backgroundColor: colors.backgroundAccent,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[4],
    paddingTop: space[2],
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: space[2],
    minHeight: 40,
  },
  likeActive: {
    opacity: 1,
  },
  pressed: {
    opacity: 0.9,
  },
  comments: {
    gap: space[3],
  },
  composer: {
    gap: space[2],
    padding: space[4],
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  replyHint: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  input: {
    minHeight: 80,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: space[3],
    textAlignVertical: 'top',
    color: colors.text,
    backgroundColor: colors.background,
    fontFamily: 'SourceSans3_400Regular',
    fontSize: 16,
  },
});
