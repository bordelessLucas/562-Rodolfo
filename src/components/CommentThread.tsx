import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Typography } from '@/src/components/Typography';
import type { CommunityComment } from '@/src/domain/community';
import { colors, space } from '@/src/theme';

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

type CommentRowProps = {
  comment: CommunityComment;
  canReply: boolean;
  isActive: boolean;
  compact?: boolean;
  onReply?: (parentId: string) => void;
};

function CommentRow({
  comment,
  canReply,
  isActive,
  compact = false,
  onReply,
}: CommentRowProps) {
  return (
    <View style={styles.row}>
      <View style={[styles.avatar, compact ? styles.avatarReply : null]}>
        <Typography variant="caption" color={colors.primary}>
          {initials(comment.authorName)}
        </Typography>
      </View>

      <View style={styles.content}>
        <View style={styles.nameRow}>
          <Typography variant="bodyStrong" style={styles.name}>
            {comment.authorName}
          </Typography>
          <Typography variant="caption" color={colors.textMuted}>
            {formatTime(comment.createdAt)}
          </Typography>
        </View>

        <Typography variant="body">{comment.body}</Typography>

        {canReply && onReply ? (
          <Pressable
            hitSlop={8}
            onPress={() => onReply(comment.id)}
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
  );
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
      <View style={styles.empty}>
        <Typography variant="bodyStrong">Ainda sem mensagens</Typography>
        <Typography variant="body" color={colors.textMuted}>
          A conversa desta publicação começa aqui. Seja a primeira pessoa a
          escrever.
        </Typography>
      </View>
    );
  }

  return (
    <View style={styles.list}>
      {roots.map((root) => {
        const replies = repliesByParent[root.id] ?? [];
        const isActive = activeReplyId === root.id;
        return (
          <View key={root.id} style={styles.thread}>
            <CommentRow
              comment={root}
              canReply={canReply}
              isActive={isActive}
              onReply={onReply}
            />

            {replies.length > 0 ? (
              <View style={styles.replies}>
                {replies.map((reply) => (
                  <CommentRow
                    key={reply.id}
                    comment={reply}
                    canReply={false}
                    isActive={false}
                    compact
                  />
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
  empty: {
    gap: space[2],
    paddingVertical: space[2],
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
    backgroundColor: colors.surface,
  },
  avatarReply: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  content: {
    flex: 1,
    gap: 2,
    paddingTop: 1,
  },
  nameRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'baseline',
    gap: space[2],
  },
  name: {
    flexShrink: 1,
  },
  replyAction: {
    alignSelf: 'flex-start',
    paddingTop: space[1],
    minHeight: 28,
    justifyContent: 'center',
  },
  replies: {
    marginLeft: space[8],
    gap: space[3],
    paddingLeft: space[3],
    borderLeftWidth: 2,
    borderLeftColor: colors.border,
  },
});
