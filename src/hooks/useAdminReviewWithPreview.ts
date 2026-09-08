import { useCallback, useEffect, useState } from 'react';

import type { CourseDetail } from '@/src/domain/course';
import { getCourseDetail } from '@/src/services/course.service';
import { useAdminReview } from '@/src/hooks/useAdminReview';

export function useAdminReviewWithPreview() {
  const review = useAdminReview();
  const [previewById, setPreviewById] = useState<
    Record<string, CourseDetail | null>
  >({});
  const [previewLoadingId, setPreviewLoadingId] = useState<string | null>(null);
  const [previewErrorById, setPreviewErrorById] = useState<
    Record<string, string>
  >({});

  const loadPreview = useCallback(async (courseId: string) => {
    setPreviewLoadingId(courseId);
    setPreviewErrorById((prev) => {
      const next = { ...prev };
      delete next[courseId];
      return next;
    });
    try {
      const detail = await getCourseDetail(courseId);
      setPreviewById((prev) => ({ ...prev, [courseId]: detail }));
      if (!detail) {
        setPreviewErrorById((prev) => ({
          ...prev,
          [courseId]: 'Conteúdo não encontrado.',
        }));
      }
    } catch (err) {
      setPreviewErrorById((prev) => ({
        ...prev,
        [courseId]:
          err instanceof Error
            ? err.message
            : 'Não foi possível carregar o conteúdo.',
      }));
    } finally {
      setPreviewLoadingId(null);
    }
  }, []);

  useEffect(() => {
    // Limpa previews de cursos que saíram da fila.
    const ids = new Set(review.courses.map((item) => item.id));
    setPreviewById((prev) => {
      const next: Record<string, CourseDetail | null> = {};
      for (const [id, value] of Object.entries(prev)) {
        if (ids.has(id)) {
          next[id] = value;
        }
      }
      return next;
    });
  }, [review.courses]);

  return {
    ...review,
    previewById,
    previewLoadingId,
    previewErrorById,
    loadPreview,
  };
}
