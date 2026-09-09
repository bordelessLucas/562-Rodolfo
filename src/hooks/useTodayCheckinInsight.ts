import { useCallback, useEffect, useMemo, useState } from 'react';

import type { DailyCheckin } from '@/src/domain/checkin';
import {
  assessDailyCheckin,
  type CheckinInsight,
} from '@/src/domain/checkinInsight';
import { getCheckinByDate } from '@/src/services/checkin.service';
import { toDateKey } from '@/src/utils/navigation';

export function useTodayCheckinInsight(userId: string | undefined) {
  const [checkin, setCheckin] = useState<DailyCheckin | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    if (!userId) {
      setCheckin(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const today = await getCheckinByDate(userId, toDateKey(new Date()));
      setCheckin(today);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Não foi possível analisar o check-in de hoje.',
      );
      setCheckin(null);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const insight: CheckinInsight = useMemo(
    () => assessDailyCheckin(checkin),
    [checkin],
  );

  return { checkin, insight, loading, error, refresh };
}
