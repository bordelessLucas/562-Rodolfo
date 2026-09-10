import { useCallback, useEffect, useMemo, useState } from 'react';

import type {
  Community,
  CommunityComment,
  CommunityPost,
} from '@/src/domain/community';
import { canUserAccessByPolicy } from '@/src/domain/community';
import { useAuth } from '@/src/hooks/useAuth';
import {
  createPostComment,
  getCommunityById,
  getCommunityPost,
  getMembership,
  hasLikedPost,
  listPostComments,
  togglePostLike,
} from '@/src/services/community.service';

export function useCommunityPostDetail(
  communityId: string | undefined,
  postId: string | undefined,
) {
  const { user, profile } = useAuth();
  const [community, setCommunity] = useState<Community | null>(null);
  const [post, setPost] = useState<CommunityPost | null>(null);
  const [comments, setComments] = useState<CommunityComment[]>([]);
  const [liked, setLiked] = useState(false);
  const [isMember, setIsMember] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [replyToId, setReplyToId] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!communityId || !postId) {
      return;
    }
    setLoading(true);
    setError('');
    try {
      const [nextCommunity, nextPost] = await Promise.all([
        getCommunityById(communityId),
        getCommunityPost(communityId, postId),
      ]);
      setCommunity(nextCommunity);
      setPost(nextPost);
      if (!nextCommunity || !nextPost || !user) {
        setComments([]);
        setLiked(false);
        setIsMember(false);
        return;
      }
      const membership = await getMembership(communityId, user.uid);
      setIsMember(Boolean(membership));
      const [nextComments, nextLiked] = await Promise.all([
        listPostComments(communityId, postId),
        hasLikedPost({ communityId, postId, userId: user.uid }),
      ]);
      setComments(nextComments);
      setLiked(nextLiked);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Não foi possível abrir a publicação.',
      );
    } finally {
      setLoading(false);
    }
  }, [communityId, postId, user]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const canComment = useMemo(() => {
    if (!community || !user || !profile) {
      return false;
    }
    if (
      !isMember &&
      community.createdBy !== user.uid &&
      profile.role !== 'admin'
    ) {
      return false;
    }
    return canUserAccessByPolicy({
      policy: community.commentPolicy,
      userId: user.uid,
      userRole: profile.role,
      ownerId: community.createdBy,
    });
  }, [community, user, profile, isMember]);

  const toggleLike = useCallback(async () => {
    if (!user || !communityId || !postId) {
      return;
    }
    setBusy(true);
    setError('');
    try {
      const result = await togglePostLike({
        communityId,
        postId,
        userId: user.uid,
      });
      setLiked(result.liked);
      setPost((prev) =>
        prev ? { ...prev, likeCount: result.likeCount } : prev,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao curtir.');
    } finally {
      setBusy(false);
    }
  }, [user, communityId, postId]);

  const publishComment = useCallback(
    async (body: string) => {
      if (!user || !communityId || !postId || !profile) {
        return;
      }
      setBusy(true);
      setError('');
      try {
        await createPostComment({
          communityId,
          postId,
          authorId: user.uid,
          authorName: profile.name,
          body,
          parentCommentId: replyToId,
        });
        setReplyToId(null);
        await refresh();
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Falha ao comentar.',
        );
      } finally {
        setBusy(false);
      }
    },
    [user, communityId, postId, profile, replyToId, refresh],
  );

  return {
    community,
    post,
    comments,
    liked,
    canComment,
    loading,
    busy,
    error,
    replyToId,
    setReplyToId,
    refresh,
    toggleLike,
    publishComment,
  };
}
