import { useCallback, useState } from 'react';

import { useAuth } from '@/src/hooks/useAuth';
import { seedPublishedMockArticles } from '@/src/services/article.service';
import { seedPublishedMockCourses } from '@/src/services/course.service';

export function useAdminSeed() {
  const { user } = useAuth();
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
      setSeedMessage(
        `Demo: cursos ${courses.created} novos / ${courses.skipped} existentes · artigos ${articles.created} novos / ${articles.skipped} existentes.`,
      );
      return { courses, articles };
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
  }, [user]);

  return { seeding, seedMessage, seedError, runSeed };
}
