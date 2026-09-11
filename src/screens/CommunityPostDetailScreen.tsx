import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, type Href } from 'expo-router';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  Button,
  CommentThread,
  InlineMessage,
  LikeActionButton,
  OptionsPopup,
  Typography,
  type OptionsPopupItem,
} from '@/src/components';
import { useCommunityPostDetail } from '@/src/hooks/useCommunityPostDetail';
import { useDoubleTap } from '@/src/hooks/useDoubleTap';
import { usePostMute } from '@/src/hooks/usePostMute';
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

  const { muted, toggleMute } = usePostMute(communityId, postId);
  const scrollRef = useRef<ScrollView>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [composerOpen, setComposerOpen] = useState(false);
  const [burstKey, setBurstKey] = useState(0);

  const isComposing = composerOpen || Boolean(replyToId);

  const handleLikeButton = useCallback(() => {
    if (busy) {
      return;
    }
    void toggleLike();
  }, [busy, toggleLike]);

  const handleDoubleTapLike = useCallback(() => {
    if (isComposing) {
      return;
    }
    setBurstKey((current) => current + 1);
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (!liked && !busy) {
      void toggleLike();
    }
  }, [busy, isComposing, liked, toggleLike]);

  const handleImagePress = useDoubleTap(handleDoubleTapLike, undefined, {
    enabled: !isComposing,
  });

  const openComposer = useCallback(() => {
    setComposerOpen(true);
    requestAnimationFrame(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    });
  }, []);

  const closeComposer = useCallback(() => {
    setComposerOpen(false);
    setDraft('');
    setReplyToId(null);
  }, [setReplyToId]);

  const menuItems = useMemo<OptionsPopupItem[]>(
    () => [
      {
        id: 'mute',
        icon: muted ? 'notifications-off-outline' : 'notifications-outline',
        label: muted ? 'Ativar notificações' : 'Silenciar publicação',
        hint: muted
          ? 'Preferência salva neste aparelho.'
          : 'Evita avisos desta conversa neste aparelho.',
        onPress: () => {
          void toggleMute();
        },
      },
    ],
    [muted, toggleMute],
  );

  const backHref =
    `/(paciente)/comunidade/${communityId ?? ''}` as Href;

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safe}>
      <View style={styles.topBar}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Voltar ao grupo"
          hitSlop={8}
          onPress={() => goBackOrReplace(backHref)}
          style={({ pressed }) => [
            styles.topButton,
            pressed ? styles.pressed : null,
          ]}
        >
          <Ionicons name="chevron-back" size={22} color={colors.primary} />
        </Pressable>

        <View style={styles.topTitle}>
          <Typography variant="label" numberOfLines={1}>
            {post?.title ?? 'Publicação'}
          </Typography>
          {muted ? (
            <Typography variant="caption" color={colors.textMuted}>
              Silenciada
            </Typography>
          ) : null}
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Opções da publicação"
          hitSlop={8}
          onPress={() => setMenuOpen(true)}
          style={({ pressed }) => [
            styles.topButton,
            pressed ? styles.pressed : null,
          ]}
        >
          <Ionicons name="ellipsis-horizontal" size={22} color={colors.text} />
        </Pressable>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
      >
        <ScrollView
          ref={scrollRef}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {error ? (
            <View style={styles.padded}>
              <InlineMessage message={error} variant="error" />
            </View>
          ) : null}

          {loading && !post ? (
            <ActivityIndicator color={colors.primary} style={styles.loader} />
          ) : null}

          {post ? (
            <View style={styles.postRoom}>
              <View style={styles.postBody}>
                <View style={styles.authorRow}>
                  <View style={styles.avatar}>
                    <Typography variant="caption" color={colors.primary}>
                      {initials(post.authorName)}
                    </Typography>
                  </View>
                  <View style={styles.authorText}>
                    <Typography variant="bodyStrong">
                      {post.authorName}
                    </Typography>
                    <Typography variant="caption" color={colors.textMuted}>
                      {post.createdAt.toLocaleString('pt-BR')}
                    </Typography>
                  </View>
                </View>

                <Typography variant="h2">{post.title}</Typography>

                <View style={styles.imageStage}>
                  {post.imageUrl ? (
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel="Toque duas vezes para curtir"
                      accessibilityState={{ disabled: isComposing }}
                      disabled={isComposing}
                      onPress={handleImagePress}
                    >
                      <Image
                        source={{ uri: post.imageUrl }}
                        style={styles.image}
                        contentFit="cover"
                        transition={250}
                      />
                    </Pressable>
                  ) : (
                    <View style={styles.imageFallback}>
                      <Typography variant="caption" color={colors.textMuted}>
                        Sem imagem
                      </Typography>
                    </View>
                  )}
                </View>

                <Typography variant="body">{post.body}</Typography>

                <View style={styles.actions}>
                  <LikeActionButton
                    liked={liked}
                    count={post.likeCount}
                    busy={busy}
                    burstKey={burstKey}
                    label={`${post.likeCount} curtidas`}
                    onPress={handleLikeButton}
                  />
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Escrever comentário"
                    onPress={openComposer}
                    style={({ pressed }) => [
                      styles.actionBtn,
                      pressed ? styles.pressed : null,
                    ]}
                  >
                    <Ionicons
                      name="chatbubble-outline"
                      size={19}
                      color={colors.textMuted}
                    />
                    <Typography variant="caption" color={colors.textMuted}>
                      {post.commentCount} comentários
                    </Typography>
                  </Pressable>
                </View>
              </View>

              <View style={styles.conversation}>
                <View style={styles.conversationHeader}>
                  <Typography variant="h3">Comentários</Typography>
                  <Typography variant="caption" color={colors.textMuted}>
                    {comments.length}
                  </Typography>
                </View>

                <CommentThread
                  comments={comments}
                  canReply={canComment}
                  activeReplyId={replyToId}
                  onReply={(parentId) => {
                    setReplyToId(parentId);
                    setComposerOpen(true);
                    requestAnimationFrame(() => {
                      scrollRef.current?.scrollToEnd({ animated: true });
                    });
                  }}
                />

                {canComment ? (
                  !isComposing ? (
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel="Adicionar um comentário"
                      onPress={openComposer}
                      style={({ pressed }) => [
                        styles.commentPrompt,
                        pressed ? styles.pressed : null,
                      ]}
                    >
                      <Ionicons
                        name="create-outline"
                        size={18}
                        color={colors.primary}
                      />
                      <Typography variant="body" color={colors.textMuted}>
                        Adicionar um comentário…
                      </Typography>
                    </Pressable>
                  ) : (
                    <View style={styles.composerInline}>
                      {replyToId ? (
                        <View style={styles.replyHint}>
                          <Typography
                            variant="caption"
                            color={colors.textMuted}
                          >
                            Respondendo na conversa
                          </Typography>
                          <Pressable onPress={closeComposer} hitSlop={8}>
                            <Typography
                              variant="caption"
                              color={colors.primary}
                            >
                              Cancelar
                            </Typography>
                          </Pressable>
                        </View>
                      ) : (
                        <View style={styles.replyHint}>
                          <Typography
                            variant="caption"
                            color={colors.textMuted}
                          >
                            Novo comentário
                          </Typography>
                          <Pressable onPress={closeComposer} hitSlop={8}>
                            <Typography
                              variant="caption"
                              color={colors.primary}
                            >
                              Fechar
                            </Typography>
                          </Pressable>
                        </View>
                      )}
                      <TextInput
                        value={draft}
                        onChangeText={setDraft}
                        autoFocus
                        placeholder={
                          replyToId
                            ? 'Escreva sua resposta…'
                            : 'Escreva um comentário…'
                        }
                        placeholderTextColor={colors.textMuted}
                        style={styles.input}
                        multiline
                        onFocus={() => {
                          scrollRef.current?.scrollToEnd({ animated: true });
                        }}
                      />
                      <Button
                        label={
                          replyToId
                            ? 'Publicar resposta'
                            : 'Publicar comentário'
                        }
                        loading={busy}
                        disabled={draft.trim().length === 0}
                        onPress={async () => {
                          const body = draft.trim();
                          if (!body) {
                            return;
                          }
                          await publishComment(body);
                          setDraft('');
                          setComposerOpen(false);
                        }}
                      />
                    </View>
                  )
                ) : (
                  <InlineMessage
                    message="Comentários limitados pela política deste grupo."
                    variant="info"
                  />
                )}
              </View>
            </View>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>

      <OptionsPopup
        visible={menuOpen}
        title="Opções da publicação"
        items={menuItems}
        onClose={() => setMenuOpen(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[2],
    paddingHorizontal: space[4],
    paddingVertical: space[2],
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  topButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topTitle: {
    flex: 1,
    gap: 1,
  },
  pressed: {
    opacity: 0.7,
  },
  scrollContent: {
    paddingBottom: space[8],
    flexGrow: 1,
  },
  padded: {
    paddingHorizontal: space[5],
    paddingTop: space[4],
  },
  loader: {
    marginTop: space[8],
  },
  postRoom: {
    marginTop: space[3],
    marginHorizontal: space[4],
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  postBody: {
    gap: space[3],
    padding: space[4],
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
  imageStage: {
    position: 'relative',
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 180,
    backgroundColor: colors.backgroundAccent,
  },
  imageFallback: {
    width: '100%',
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.backgroundAccent,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[4],
    paddingTop: space[1],
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: space[1],
    minHeight: 36,
  },
  conversation: {
    gap: space[3],
    paddingHorizontal: space[4],
    paddingBottom: space[4],
    paddingTop: space[3],
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    backgroundColor: colors.backgroundAccent,
  },
  conversationHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: space[3],
  },
  commentPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[2],
    marginTop: space[1],
    paddingVertical: space[3],
    paddingHorizontal: space[3],
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  composerInline: {
    gap: space[2],
    marginTop: space[1],
    padding: space[3],
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  replyHint: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  input: {
    minHeight: 56,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: space[3],
    paddingVertical: space[2],
    textAlignVertical: 'top',
    color: colors.text,
    backgroundColor: colors.background,
    fontFamily: 'SourceSans3_400Regular',
    fontSize: 15,
    lineHeight: 20,
  },
});
