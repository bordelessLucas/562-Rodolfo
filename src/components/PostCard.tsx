import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Typography } from '@/src/components/Typography';
import type { CommunityPost } from '@/src/domain/community';
import { colors, radius, space } from '@/src/theme';

type PostCardProps = {
  post: CommunityPost;
  onPress: () => void;
};

export function PostCard({ post, onPress }: PostCardProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        pressed ? styles.pressed : null,
      ]}
    >
      {post.imageUrl ? (
        <Image
          source={{ uri: post.imageUrl }}
          style={styles.thumb}
          contentFit="cover"
          transition={200}
        />
      ) : null}
      <View style={styles.body}>
        <Typography variant="h3">{post.title}</Typography>
        <Typography variant="body" color={colors.textMuted} numberOfLines={3}>
          {post.summary}
        </Typography>
        <View style={styles.meta}>
          <Typography variant="caption" color={colors.textMuted}>
            {post.authorName} ·{' '}
            {post.createdAt.toLocaleDateString('pt-BR')}
          </Typography>
          <View style={styles.stats}>
            <Ionicons name="heart-outline" size={14} color={colors.primary} />
            <Typography variant="caption" color={colors.primary}>
              {post.likeCount}
            </Typography>
            <Ionicons
              name="chatbubble-outline"
              size={14}
              color={colors.primary}
            />
            <Typography variant="caption" color={colors.primary}>
              {post.commentCount}
            </Typography>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    shadowColor: colors.text,
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  pressed: {
    opacity: 0.94,
    transform: [{ scale: 0.995 }],
  },
  thumb: {
    width: '100%',
    height: 168,
    backgroundColor: colors.backgroundAccent,
  },
  body: {
    gap: space[2],
    padding: space[4],
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space[2],
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
});
