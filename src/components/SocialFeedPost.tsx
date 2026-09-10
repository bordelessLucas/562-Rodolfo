import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Typography } from '@/src/components/Typography';
import type { CommunityComment, CommunityPost } from '@/src/domain/community';
import { colors, radius, space } from '@/src/theme';

export type FeedPostItem = {
  post: CommunityPost;
  liked: boolean;
  previewComments: CommunityComment[];
};

type SocialFeedPostProps = {
  item: FeedPostItem;
  onOpen: () => void;
  onToggleLike: () => void;
  likeBusy?: boolean;
};

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

export function SocialFeedPost({
  item,
  onOpen,
  onToggleLike,
  likeBusy = false,
}: SocialFeedPostProps) {
  const { post, liked, previewComments } = item;
  const roots = previewComments.filter((c) => !c.parentCommentId).slice(0, 2);

  return (
    <View style={styles.card}>
      <Pressable
        accessibilityRole="button"
        onPress={onOpen}
        style={({ pressed }) => (pressed ? styles.pressed : null)}
      >
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Typography variant="caption" color={colors.primary}>
              {initials(post.authorName)}
            </Typography>
          </View>
          <View style={styles.headerText}>
            <Typography variant="bodyStrong">{post.authorName}</Typography>
            <Typography variant="caption" color={colors.textMuted}>
              {post.createdAt.toLocaleString('pt-BR', {
                day: '2-digit',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Typography>
          </View>
        </View>

        <Typography variant="h3">{post.title}</Typography>
        <Typography variant="body" color={colors.textMuted} numberOfLines={3}>
          {post.summary}
        </Typography>

        {post.imageUrl ? (
          <Image
            source={{ uri: post.imageUrl }}
            style={styles.image}
            contentFit="cover"
            transition={220}
          />
        ) : null}
      </Pressable>

      <View style={styles.actions}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={liked ? 'Remover curtida' : 'Curtir'}
          disabled={likeBusy}
          onPress={onToggleLike}
          style={({ pressed }) => [
            styles.actionBtn,
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
            {post.likeCount}
          </Typography>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Abrir comentários"
          onPress={onOpen}
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
            {post.commentCount}
          </Typography>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          onPress={onOpen}
          style={({ pressed }) => [
            styles.actionBtn,
            pressed ? styles.pressed : null,
          ]}
        >
          <Typography variant="caption" color={colors.primary}>
            Ver thread
          </Typography>
        </Pressable>
      </View>

      {roots.length > 0 ? (
        <View style={styles.preview}>
          {roots.map((comment) => (
            <Pressable key={comment.id} onPress={onOpen} style={styles.previewRow}>
              <Typography variant="caption" color={colors.primary}>
                {comment.authorName}
              </Typography>
              <Typography
                variant="caption"
                color={colors.textMuted}
                numberOfLines={2}
                style={styles.previewBody}
              >
                {comment.body}
              </Typography>
            </Pressable>
          ))}
          {post.commentCount > roots.length ? (
            <Pressable onPress={onOpen}>
              <Typography variant="caption" color={colors.primary}>
                Ver todos os {post.commentCount} comentários
              </Typography>
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: space[3],
    padding: space[4],
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pressed: {
    opacity: 0.92,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
    marginBottom: space[1],
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.backgroundAccent,
  },
  headerText: {
    flex: 1,
    gap: 2,
  },
  image: {
    marginTop: space[1],
    width: '100%',
    height: 180,
    borderRadius: radius.md,
    backgroundColor: colors.backgroundAccent,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[4],
    paddingTop: space[1],
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
  preview: {
    gap: space[2],
    paddingTop: space[1],
  },
  previewRow: {
    gap: 2,
  },
  previewBody: {
    flexShrink: 1,
  },
});
