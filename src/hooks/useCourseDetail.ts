import { useCallback, useEffect, useState } from 'react';

import type { CourseDetail, LessonProgress } from '@/src/domain/course';
import { getCourseDetail } from '@/src/services/course.service';
import { listProgressByCourse } from '@/src/services/courseProgress.service';

export function useCourseDetail(courseId: string | undefined, userId?: string) {
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [progress, setProgress] = useState<LessonProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!courseId) {
      setCourse(null);
      setProgress([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const detail = await getCourseDetail(courseId);
      setCourse(detail);
      if (userId && detail) {
        try {
          const items = await listProgressByCourse(userId, courseId);
          setProgress(items);
        } catch {
          setProgress([]);
        }
      } else {
        setProgress([]);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Não foi possível carregar o curso.',
      );
    } finally {
      setLoading(false);
    }
  }, [courseId, userId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { course, progress, loading, error, refresh };
}
