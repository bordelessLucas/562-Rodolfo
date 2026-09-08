import { useCallback, useEffect, useMemo, useState } from 'react';

import { listCheckinsByUser } from '@/src/services/checkin.service';
import {
  getCurrentWeekDays,
  type WeekDayStatus,
} from '@/src/utils/weekCheckin';
import { isToday, toDateKey } from '@/src/utils/navigation';

export function useWeekCheckins(userId: string | undefined) {
  const [doneDates, setDoneDates] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!userId) {
      setDoneDates(new Set());
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const list = await listCheckinsByUser(userId, 14);
      setDoneDates(new Set(list.map((item) => item.date)));
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Não foi possível carregar a semana.',
      );
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const weekDays: WeekDayStatus[] = useMemo(() => {
    return getCurrentWeekDays().map((day) => ({
      ...day,
      done: doneDates.has(day.dateKey),
    }));
  }, [doneDates]);

  const todayDone = doneDates.has(toDateKey(new Date()));

  return {
    weekDays,
    todayDone,
    loading,
    error,
    refresh,
    isToday,
  };
}
