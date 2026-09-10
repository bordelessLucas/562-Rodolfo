import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Typography } from '@/src/components/Typography';
import type { CommunityComment } from '@/src/domain/community';
import { colors, radius, space } from '@/src/theme';

type CommentThreadProps = {
  comments: CommunityComment[];
  canReply: boolean;
  onReply: (parentId: string) => void;
  activeReplyId?: string | null;
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

function formatTime(date: Date): string {
  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function CommentThread({
  comments,
  canReply,
  onReply,
  activeReplyId = null,
}: CommentThreadProps) {
  const roots = comments.filter((item) => !item.parentCommentId);
  const repliesByParent = comments.reduce<Record<string, CommunityComment[]>>(
    (acc, item) => {
      if (!item.parentCommentId) {
        return acc;
      }
      const list = acc[item.parentCommentId] ?? [];
      list.push(item);
      acc[item.parentCommentId] = list;
      return acc;
    },
    {},
  );

  if (roots.length === 0) {
    return (
      <Typography variant="body" color={colors.textMuted}>
        Seja a primeira pessoa a comentar.
      </Typography>
    );
  }

  return (
    <View style={styles.list}>
      {roots.map((root) => {
        const replies = repliesByParent[root.id] ?? [];
        const isActive = activeReplyId === root.id;
        return (
          <View key={root.id} style={styles.thread}>
            <View style={styles.row}>
              <View style={styles.avatar}>
                <Typography variant="caption" color={colors.primary}>
                  {initials(root.authorName)}
                </Typography>
              </View>
              <View style={styles.bubble}>
                <View style={styles.meta}>
                  <Typography variant="bodyStrong">{root.authorName}</Typography>
                  <Typography variant="caption" color={colors.textMuted}>
                    {formatTime(root.createdAt)}
                  </Typography>
                </View>
                <Typography variant="body">{root.body}</Typography>
                {canReply ? (
                  <Pressable
                    hitSlop={8}
                    onPress={() => onReply(root.id)}
                    style={styles.replyAction}
                  >
                    <Typography
                      variant="caption"
                      color={isActive ? colors.secondary : colors.primary}
                    >
                      {isActive ? 'Respondendo…' : 'Responder'}
                    </Typography>
                  </Pressable>
                ) : null}
              </View>
            </View>

            {replies.length > 0 ? (
              <View style={styles.replies}>
                {replies.map((reply) => (
                  <View key={reply.id} style={styles.row}>
                    <View style={[styles.avatar, styles.avatarReply]}>
                      <Typography variant="caption" color={colors.primary}>
                        {initials(reply.authorName)}
                      </Typography>
                    </View>
                    <View style={[styles.bubble, styles.bubbleReply]}>
                      <View style={styles.meta}>
                        <Typography variant="bodyStrong">
                          {reply.authorName}
                        </Typography>
                        <Typography variant="caption" color={colors.textMuted}>
                          {formatTime(reply.createdAt)}
                        </Typography>
                      </View>
                      <Typography variant="body">{reply.body}</Typography>
                    </View>
                  </View>
                ))}
              </View>
            ) : null}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: space[4],
  },
  thread: {
    gap: space[3],
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: space[3],
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.backgroundAccent,
  },
  avatarReply: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  bubble: {
    flex: 1,
    gap: space[1],
    padding: space[3],
    borderRadius: radius.md,
    backgroundColor: colors.backgroundAccent,
  },
  bubbleReply: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  meta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: space[2],
  },
  replyAction: {
    alignSelf: 'flex-start',
    paddingTop: 2,
    minHeight: 28,
    justifyContent: 'center',
  },
  replies: {
    marginLeft: space[8],
    gap: space[3],
    paddingLeft: space[2],
    borderLeftWidth: 2,
    borderLeftColor: colors.border,
  },
});
