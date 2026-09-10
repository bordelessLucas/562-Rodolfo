import { useCallback, useEffect, useMemo, useState } from 'react';

import type { Community, CommunityTagId } from '@/src/domain/community';
import { useAuth } from '@/src/hooks/useAuth';
import { listCheckinsByUser } from '@/src/services/checkin.service';
import {
  listJoinedCommunities,
  listPublishedCommunities,
} from '@/src/services/community.service';
import {
  filterCommunities,
  recommendCommunities,
} from '@/src/services/communityRecommendation.service';

export function useCommunitiesHub() {
  const { user } = useAuth();
  const [joined, setJoined] = useState<Community[]>([]);
  const [published, setPublished] = useState<Community[]>([]);
  const [queryText, setQueryText] = useState('');
  const [tagFilter, setTagFilter] = useState<CommunityTagId | 'todos'>(
    'todos',
  );
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [recommendations, setRecommendations] = useState<Community[]>([]);

  const refresh = useCallback(async () => {
    if (!user) {
      setJoined([]);
      setPublished([]);
      setRecommendations([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const [nextJoined, nextPublished, checkins] = await Promise.all([
        listJoinedCommunities(user.uid),
        listPublishedCommunities(),
        listCheckinsByUser(user.uid, 14),
      ]);
      setJoined(nextJoined);
      setPublished(nextPublished);
      setRecommendations(
        recommendCommunities({
          published: nextPublished,
          excludeIds: new Set(nextJoined.map((item) => item.id)),
          recentCheckins: checkins,
        }),
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Não foi possível carregar as comunidades.',
      );
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const searching = queryText.trim().length > 0 || tagFilter !== 'todos';

  const searchResults = useMemo(
    () =>
      filterCommunities({
        items: published,
        queryText,
        tag: tagFilter,
      }),
    [published, queryText, tagFilter],
  );

  return {
    joined,
    recommendations,
    searchResults,
    searching,
    queryText,
    setQueryText,
    tagFilter,
    setTagFilter,
    filtersOpen,
    setFiltersOpen,
    loading,
    error,
    refresh,
  };
}
