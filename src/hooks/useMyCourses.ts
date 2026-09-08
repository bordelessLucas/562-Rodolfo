import { useCallback, useEffect, useState } from 'react';

import type { Course } from '@/src/domain/course';
import { listCoursesByCreator } from '@/src/services/course.service';

export function useMyCourses(userId: string | undefined) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!userId) {
      setCourses([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const items = await listCoursesByCreator(userId);
      setCourses(items);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Não foi possível carregar seus cursos.',
      );
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { courses, loading, error, refresh };
}
