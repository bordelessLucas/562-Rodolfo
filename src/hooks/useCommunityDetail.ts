import { useCallback, useEffect, useState } from 'react';

import type {
  Community,
  CommunityComment,
  CommunityPost,
} from '@/src/domain/community';
import { useAuth } from '@/src/hooks/useAuth';
import {
  createCommunityPost,
  createPostComment,
  getCommunityById,
  getMembership,
  joinCommunity,
  leaveCommunity,
  listCommunityPosts,
  listPostComments,
} from '@/src/services/community.service';

export function useCommunityDetail(communityId: string | undefined) {
  const { user, profile } = useAuth();
  const [community, setCommunity] = useState<Community | null>(null);
  const [isMember, setIsMember] = useState(false);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [commentsByPost, setCommentsByPost] = useState<
    Record<string, CommunityComment[]>
  >({});
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const refresh = useCallback(async () => {
    if (!communityId) {
      return;
    }
    setLoading(true);
    setError('');
    try {
      const next = await getCommunityById(communityId);
      setCommunity(next);
      if (!next) {
        setIsMember(false);
        setPosts([]);
        return;
      }
      if (user) {
        const membership = await getMembership(communityId, user.uid);
        setIsMember(Boolean(membership));
        if (membership) {
          const nextPosts = await listCommunityPosts(communityId);
          setPosts(nextPosts);
          const commentEntries = await Promise.all(
            nextPosts.slice(0, 12).map(async (post) => {
              const comments = await listPostComments(communityId, post.id);
              return [post.id, comments] as const;
            }),
          );
          setCommentsByPost(Object.fromEntries(commentEntries));
        } else {
          setPosts([]);
          setCommentsByPost({});
        }
      } else {
        setIsMember(false);
        setPosts([]);
        setCommentsByPost({});
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Não foi possível abrir a comunidade.',
      );
    } finally {
      setLoading(false);
    }
  }, [communityId, user]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const join = useCallback(async () => {
    if (!user || !communityId || !profile) {
      return;
    }
    setJoining(true);
    setError('');
    setMessage('');
    try {
      await joinCommunity({
        communityId,
        userId: user.uid,
        userName: profile.name,
      });
      setMessage('Você entrou na comunidade.');
      await refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Não foi possível entrar.',
      );
    } finally {
      setJoining(false);
    }
  }, [user, communityId, profile, refresh]);

  const leave = useCallback(async () => {
    if (!user || !communityId) {
      return;
    }
    setJoining(true);
    setError('');
    try {
      await leaveCommunity({ communityId, userId: user.uid });
      setMessage('Você saiu da comunidade.');
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível sair.');
    } finally {
      setJoining(false);
    }
  }, [user, communityId, refresh]);

  const publishPost = useCallback(
    async (body: string) => {
      if (!user || !communityId || !profile) {
        return;
      }
      const trimmed = body.trim();
      if (!trimmed) {
        setError('Escreva uma mensagem antes de publicar.');
        return;
      }
      setPosting(true);
      setError('');
      try {
        await createCommunityPost({
          communityId,
          authorId: user.uid,
          authorName: profile.name,
          body: trimmed,
        });
        setMessage('Publicação enviada.');
        await refresh();
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Falha ao publicar.',
        );
      } finally {
        setPosting(false);
      }
    },
    [user, communityId, profile, refresh],
  );

  const publishComment = useCallback(
    async (postId: string, body: string) => {
      if (!user || !communityId || !profile) {
        return;
      }
      const trimmed = body.trim();
      if (!trimmed) {
        return;
      }
      try {
        await createPostComment({
          communityId,
          postId,
          authorId: user.uid,
          authorName: profile.name,
          body: trimmed,
        });
        await refresh();
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Falha ao comentar.',
        );
      }
    },
    [user, communityId, profile, refresh],
  );

  return {
    community,
    isMember,
    posts,
    commentsByPost,
    loading,
    posting,
    joining,
    error,
    message,
    refresh,
    join,
    leave,
    publishPost,
    publishComment,
  };
}
