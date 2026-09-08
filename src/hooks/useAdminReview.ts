import { useCallback, useState } from 'react';

import { useAuth } from '@/src/hooks/useAuth';
import { usePendingCourses } from '@/src/hooks/usePendingCourses';
import {
  approveCourse,
  rejectCourse,
} from '@/src/services/course.service';

export function useAdminReview() {
  const { user } = useAuth();
  const { courses, loading, error, refresh } = usePendingCourses();
  const [reasonById, setReasonById] = useState<Record<string, string>>({});
  const [busyId, setBusyId] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [actionError, setActionError] = useState('');

  const setReason = useCallback((courseId: string, text: string) => {
    setReasonById((prev) => ({ ...prev, [courseId]: text }));
  }, []);

  const approve = useCallback(
    async (courseId: string) => {
      if (!user) {
        return;
      }
      setBusyId(courseId);
      setActionError('');
      setMessage('');
      try {
        await approveCourse(courseId, user.uid);
        setMessage('Curso aprovado e publicado.');
        await refresh();
      } catch (err) {
        setActionError(
          err instanceof Error ? err.message : 'Falha ao aprovar.',
        );
      } finally {
        setBusyId(null);
      }
    },
    [user, refresh],
  );

  const reject = useCallback(
    async (courseId: string) => {
      if (!user) {
        return;
      }
      setBusyId(courseId);
      setActionError('');
      setMessage('');
      try {
        await rejectCourse(courseId, user.uid, reasonById[courseId] ?? '');
        setMessage('Curso rejeitado.');
        await refresh();
      } catch (err) {
        setActionError(
          err instanceof Error ? err.message : 'Falha ao rejeitar.',
        );
      } finally {
        setBusyId(null);
      }
    },
    [user, reasonById, refresh],
  );

  return {
    courses,
    loading,
    error,
    refresh,
    reasonById,
    setReason,
    busyId,
    message,
    actionError,
    approve,
    reject,
  };
}
