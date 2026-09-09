import { useCallback, useEffect, useState } from 'react';

import type { Community } from '@/src/domain/community';
import { listPublishedCommunities } from '@/src/services/community.service';

export function usePublishedCommunities() {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setCommunities(await listPublishedCommunities());
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Não foi possível carregar as comunidades.',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { communities, loading, error, refresh };
}
