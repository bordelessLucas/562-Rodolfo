import { useCallback, useState } from 'react';

import { useAuth } from '@/src/hooks/useAuth';
import { seedPublishedMockArticles } from '@/src/services/article.service';
import { seedDemoCommunities } from '@/src/services/community.service';
import { seedPublishedMockCourses } from '@/src/services/course.service';

export function useAdminSeed() {
  const { user, profile } = useAuth();
  const [seeding, setSeeding] = useState(false);
  const [seedMessage, setSeedMessage] = useState('');
  const [seedError, setSeedError] = useState('');

  const runSeed = useCallback(async () => {
    if (!user) {
      return;
    }
    setSeeding(true);
    setSeedError('');
    setSeedMessage('');
    try {
      const courses = await seedPublishedMockCourses(user.uid);
      const articles = await seedPublishedMockArticles(user.uid);
      const communities = await seedDemoCommunities(
        user.uid,
        profile?.name ?? 'Admin',
      );
      setSeedMessage(
        [
          `Cursos publicados ${courses.created}/${courses.skipped}`,
          `fila cursos ${courses.pendingCreated}/${courses.pendingSkipped}`,
          `artigos ${articles.created}/${articles.skipped}`,
          `comunidades ${communities.created}/${communities.skipped}`,
          `fila comunidades ${communities.pendingCreated}/${communities.pendingSkipped}`,
        ].join(' · '),
      );
      return { courses, articles, communities };
    } catch (err) {
      setSeedError(
        err instanceof Error
          ? err.message
          : 'Não foi possível carregar os conteúdos de demonstração.',
      );
      return null;
    } finally {
      setSeeding(false);
    }
  }, [user, profile?.name]);

  return { seeding, seedMessage, seedError, runSeed };
}
