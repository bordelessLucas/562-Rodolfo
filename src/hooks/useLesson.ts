import { useCallback, useEffect, useMemo, useState } from 'react';

import type {
  CourseDetail,
  CourseLesson,
  LessonProgress,
} from '@/src/domain/course';
import { getCourseDetail, getLesson } from '@/src/services/course.service';
import {
  getLessonProgress,
  upsertLessonProgress,
} from '@/src/services/courseProgress.service';

type UseLessonParams = {
  courseId?: string;
  moduleId?: string;
  lessonId?: string;
  userId?: string;
};

export type NextLessonRef = {
  moduleId: string;
  lessonId: string;
  title: string;
};

function findNextLesson(
  detail: CourseDetail | null,
  moduleId: string,
  lessonId: string,
): NextLessonRef | null {
  if (!detail) {
    return null;
  }
  const flat: NextLessonRef[] = [];
  for (const mod of detail.modules) {
    for (const lesson of mod.lessons) {
      flat.push({
        moduleId: mod.id,
        lessonId: lesson.id,
        title: lesson.title,
      });
    }
  }
  const index = flat.findIndex(
    (item) => item.moduleId === moduleId && item.lessonId === lessonId,
  );
  if (index < 0 || index >= flat.length - 1) {
    return null;
  }
  return flat[index + 1] ?? null;
}

export function useLesson({
  courseId,
  moduleId,
  lessonId,
  userId,
}: UseLessonParams) {
  const [lesson, setLesson] = useState<CourseLesson | null>(null);
  const [courseDetail, setCourseDetail] = useState<CourseDetail | null>(null);
  const [progress, setProgress] = useState<LessonProgress | null>(null);
  const [progressLocalOnly, setProgressLocalOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!courseId || !lessonId) {
      setLesson(null);
      setProgress(null);
      setCourseDetail(null);
      setLoading(false);
      setError('Dados da aula incompletos. Abra novamente a partir do curso.');
      return;
    }

    if (!moduleId) {
      setLesson(null);
      setProgress(null);
      setCourseDetail(null);
      setLoading(false);
      setError(
        'Módulo da aula não informado. Abra a aula a partir da lista do curso.',
      );
      return;
    }

    setLoading(true);
    setError(null);
    setInfo(null);
    setProgressLocalOnly(false);
    try {
      const [item, detail] = await Promise.all([
        getLesson(courseId, moduleId, lessonId),
        getCourseDetail(courseId).catch(() => null),
      ]);
      setLesson(item);
      setCourseDetail(detail);
      if (!item) {
        setError('Aula não encontrada.');
      }
      if (userId && item) {
        try {
          const prog = await getLessonProgress(userId, lessonId);
          setProgress(prog);
          if (!prog) {
            const created = await upsertLessonProgress({
              userId,
              courseId,
              moduleId,
              lessonId,
              completed: false,
            });
            setProgress(created);
          }
        } catch {
          // Progresso remoto indisponível — aula ainda pode ser consumida.
          setProgress(null);
          setProgressLocalOnly(true);
          setInfo(
            'Não foi possível carregar o progresso da conta. Você ainda pode estudar a aula.',
          );
        }
      }
    } catch (err) {
      setLesson(null);
      setError(
        err instanceof Error
          ? err.message
          : 'Não foi possível carregar a aula.',
      );
    } finally {
      setLoading(false);
    }
  }, [courseId, moduleId, lessonId, userId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const markCompleted = useCallback(async () => {
    if (!userId || !courseId || !moduleId || !lessonId) {
      return;
    }
    setSaving(true);
    setError(null);
    setInfo(null);
    try {
      const saved = await upsertLessonProgress({
        userId,
        courseId,
        moduleId,
        lessonId,
        completed: true,
      });
      setProgress(saved);
      setProgressLocalOnly(false);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Não foi possível salvar o progresso na conta. Tente novamente.',
      );
      setProgressLocalOnly(true);
    } finally {
      setSaving(false);
    }
  }, [userId, courseId, moduleId, lessonId]);

  const nextLesson = useMemo(
    () =>
      courseId && moduleId && lessonId
        ? findNextLesson(courseDetail, moduleId, lessonId)
        : null,
    [courseDetail, courseId, moduleId, lessonId],
  );

  return {
    lesson,
    progress,
    progressLocalOnly,
    loading,
    saving,
    error,
    info,
    nextLesson,
    refresh,
    markCompleted,
  };
}
