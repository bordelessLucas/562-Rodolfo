import { useCallback, useEffect, useState } from 'react';

import type { CourseStatus } from '@/src/domain/course';
import { listMyCommunities } from '@/src/services/community.service';
import { listCoursesByCreator } from '@/src/services/course.service';
import { listLinksForProfessional } from '@/src/services/professionalLink.service';
import { listActivePatients } from '@/src/services/professionalPatient.service';

export type ProfessionalHomeStats = {
  activePatients: number;
  pendingInvites: number;
  coursesDraft: number;
  coursesPendingReview: number;
  coursesPublished: number;
  communitiesPending: number;
  communitiesPublished: number;
};

const EMPTY_STATS: ProfessionalHomeStats = {
  activePatients: 0,
  pendingInvites: 0,
  coursesDraft: 0,
  coursesPendingReview: 0,
  coursesPublished: 0,
  communitiesPending: 0,
  communitiesPublished: 0,
};

function countByStatus(
  statuses: CourseStatus[],
  target: CourseStatus,
): number {
  return statuses.filter((item) => item === target).length;
}

export function useProfessionalHomeStats(userId: string | undefined) {
  const [stats, setStats] = useState<ProfessionalHomeStats>(EMPTY_STATS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!userId) {
      setStats(EMPTY_STATS);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const [patients, pending, courses, communities] = await Promise.all([
        listActivePatients(userId),
        listLinksForProfessional(userId, 'pending'),
        listCoursesByCreator(userId),
        listMyCommunities(userId),
      ]);

      const courseStatuses = courses.map((course) => course.status);
      setStats({
        activePatients: patients.length,
        pendingInvites: pending.length,
        coursesDraft: countByStatus(courseStatuses, 'draft'),
        coursesPendingReview: countByStatus(courseStatuses, 'pending_review'),
        coursesPublished: countByStatus(courseStatuses, 'published'),
        communitiesPending: communities.filter((c) => c.status === 'pending')
          .length,
        communitiesPublished: communities.filter(
          (c) => c.status === 'published',
        ).length,
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Não foi possível carregar o resumo.',
      );
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { stats, loading, error, refresh };
}
