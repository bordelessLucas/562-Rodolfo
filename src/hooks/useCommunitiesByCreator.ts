import { useCallback, useEffect, useState } from 'react';

import type { Community } from '@/src/domain/community';
import type { UserProfile } from '@/src/domain/user';
import { listCommunitiesByCreator } from '@/src/services/community.service';
import { getUserProfile } from '@/src/services/user.service';

export function useCommunitiesByCreator(creatorId: string | undefined) {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    if (!creatorId) {
      setCommunities([]);
      setProfile(null);
      setLoading(false);
      setError('Usuário inválido.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const [items, user] = await Promise.all([
        listCommunitiesByCreator(creatorId),
        getUserProfile(creatorId),
      ]);
      setCommunities(items);
      setProfile(user);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Não foi possível carregar os envios deste usuário.',
      );
    } finally {
      setLoading(false);
    }
  }, [creatorId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { communities, profile, loading, error, refresh };
}
