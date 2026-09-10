import { useCallback, useEffect, useMemo, useState } from 'react';

import type { FeedPostItem } from '@/src/components/SocialFeedPost';
import type {
  Community,
  CommunityMember,
  CommunityPost,
} from '@/src/domain/community';
import {
  canUserAccessByPolicy,
  isActiveMembership,
} from '@/src/domain/community';
import { useAuth } from '@/src/hooks/useAuth';
import {
  approveMember,
  getCommunityById,
  getMembership,
  hasLikedPost,
  joinCommunity,
  leaveCommunity,
  listCommunityPosts,
  listPendingMembers,
  listPostComments,
  rejectMember,
  togglePostLike,
} from '@/src/services/community.service';

export function useCommunityDetail(communityId: string | undefined) {
  const { user, profile } = useAuth();
  const [community, setCommunity] = useState<Community | null>(null);
  const [membership, setMembership] = useState<CommunityMember | null>(null);
  const [pendingMembers, setPendingMembers] = useState<CommunityMember[]>([]);
  const [feed, setFeed] = useState<FeedPostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [moderatingId, setModeratingId] = useState<string | null>(null);
  const [likeBusyId, setLikeBusyId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const isOwner = Boolean(
    community && user && community.createdBy === user.uid,
  );
  const isMember = isActiveMembership(membership);
  const isPendingJoin = membership?.status === 'pending';

  const loadFeed = useCallback(
    async (posts: CommunityPost[], uid: string | undefined) => {
      const items = await Promise.all(
        posts.map(async (post) => {
          try {
            const [previewComments, liked] = await Promise.all([
              listPostComments(post.communityId, post.id),
              uid
                ? hasLikedPost({
                    communityId: post.communityId,
                    postId: post.id,
                    userId: uid,
                  })
                : Promise.resolve(false),
            ]);
            return {
              post,
              liked,
              previewComments: previewComments.slice(0, 4),
            } satisfies FeedPostItem;
          } catch {
            return {
              post,
              liked: false,
              previewComments: [],
            } satisfies FeedPostItem;
          }
        }),
      );
      setFeed(items);
    },
    [],
  );

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
        setMembership(null);
        setPendingMembers([]);
        setFeed([]);
        return;
      }

      let nextMembership: CommunityMember | null = null;
      if (user) {
        nextMembership = await getMembership(communityId, user.uid);
        setMembership(nextMembership);
      } else {
        setMembership(null);
      }

      const owner =
        Boolean(user && next.createdBy === user.uid) ||
        profile?.role === 'admin';
      if (owner) {
        try {
          setPendingMembers(await listPendingMembers(communityId));
        } catch {
          setPendingMembers([]);
        }
      } else {
        setPendingMembers([]);
      }

      const canSeeFeed =
        isActiveMembership(nextMembership) ||
        Boolean(user && next.createdBy === user.uid) ||
        profile?.role === 'admin';
      if (canSeeFeed && user) {
        const posts = await listCommunityPosts(communityId);
        await loadFeed(posts, user.uid);
      } else {
        setFeed([]);
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
  }, [communityId, user, profile?.role, loadFeed]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const canPost = useMemo(() => {
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
      policy: community.postPolicy,
      userId: user.uid,
      userRole: profile.role,
      ownerId: community.createdBy,
    });
  }, [community, user, profile, isMember]);

  const join = useCallback(async () => {
    if (!user || !communityId || !profile) {
      return;
    }
    setJoining(true);
    setError('');
    setMessage('');
    try {
      const result = await joinCommunity({
        communityId,
        userId: user.uid,
        userName: profile.name,
      });
      setMessage(
        result === 'pending'
          ? 'Solicitação enviada. Aguarde a aprovação do dono do grupo.'
          : 'Você entrou na comunidade.',
      );
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
      setMessage(
        membership?.status === 'pending'
          ? 'Solicitação cancelada.'
          : 'Você saiu da comunidade.',
      );
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível sair.');
    } finally {
      setJoining(false);
    }
  }, [user, communityId, membership?.status, refresh]);

  const approve = useCallback(
    async (memberId: string) => {
      if (!user || !communityId) {
        return;
      }
      setModeratingId(memberId);
      setError('');
      try {
        await approveMember({
          communityId,
          memberId,
          reviewerId: user.uid,
        });
        setMessage('Solicitação aprovada.');
        await refresh();
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Falha ao aprovar.',
        );
      } finally {
        setModeratingId(null);
      }
    },
    [user, communityId, refresh],
  );

  const reject = useCallback(
    async (memberId: string) => {
      if (!user || !communityId) {
        return;
      }
      setModeratingId(memberId);
      setError('');
      try {
        await rejectMember({
          communityId,
          memberId,
          reviewerId: user.uid,
        });
        setMessage('Solicitação recusada.');
        await refresh();
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Falha ao recusar.',
        );
      } finally {
        setModeratingId(null);
      }
    },
    [user, communityId, refresh],
  );

  const toggleLike = useCallback(
    async (postId: string) => {
      if (!user || !communityId) {
        return;
      }
      setLikeBusyId(postId);
      setError('');
      try {
        const result = await togglePostLike({
          communityId,
          postId,
          userId: user.uid,
        });
        setFeed((prev) =>
          prev.map((item) =>
            item.post.id === postId
              ? {
                  ...item,
                  liked: result.liked,
                  post: { ...item.post, likeCount: result.likeCount },
                }
              : item,
          ),
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Falha ao curtir.');
      } finally {
        setLikeBusyId(null);
      }
    },
    [user, communityId],
  );

  return {
    community,
    membership,
    isMember,
    isPendingJoin,
    isOwner,
    pendingMembers,
    feed,
    canPost,
    loading,
    joining,
    moderatingId,
    likeBusyId,
    error,
    message,
    refresh,
    join,
    leave,
    approve,
    reject,
    toggleLike,
  };
}
