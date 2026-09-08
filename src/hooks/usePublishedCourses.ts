import { useCallback, useEffect, useMemo, useState } from 'react';

import type { Course } from '@/src/domain/course';
import { isCoursesDemoMode } from '@/src/config/coursesDemo';
import { listPublishedCourses } from '@/src/services/course.service';

export function usePublishedCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usedDemoFallback, setUsedDemoFallback] = useState(false);
  const [demoReason, setDemoReason] = useState<'empty' | 'error' | undefined>();

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await listPublishedCourses();
      setCourses(result.courses);
      setUsedDemoFallback(result.usedDemoFallback);
      setDemoReason(result.demoReason);
    } catch (err) {
      setCourses([]);
      setUsedDemoFallback(false);
      setDemoReason(undefined);
      setError(
        err instanceof Error
          ? err.message
          : 'Não foi possível carregar os cursos.',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const usingLocalMock = useMemo(
    () => usedDemoFallback && isCoursesDemoMode(),
    [usedDemoFallback],
  );

  return {
    courses,
    loading,
    error,
    refresh,
    usingLocalMock,
    demoReason,
  };
}
