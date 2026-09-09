import { useCallback, useEffect, useState } from 'react';

import type { Course } from '@/src/domain/course';
import { listCoursesByStatus } from '@/src/services/course.service';

export function usePendingCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const items = await listCoursesByStatus('pending_review');
      setCourses(items);
    } catch (err) {
      const code =
        typeof err === 'object' &&
        err !== null &&
        'code' in err &&
        typeof (err as { code: unknown }).code === 'string'
          ? (err as { code: string }).code
          : '';
      if (code === 'permission-denied') {
        setError(
          'Sem permissão para ver a fila. Confirme a conta admin e tente de novo.',
        );
      } else {
        setError(
          err instanceof Error
            ? err.message
            : 'Não foi possível carregar a fila de revisão.',
        );
      }
      setCourses([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { courses, loading, error, refresh };
}
