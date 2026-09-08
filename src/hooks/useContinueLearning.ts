import { useCallback, useEffect, useState } from 'react';

import type { ContentArticle } from '@/src/domain/article';
import type { Course, LessonProgress } from '@/src/domain/course';
import { listPublishedArticles } from '@/src/services/article.service';
import {
  getCourseById,
  listPublishedCourses,
} from '@/src/services/course.service';
import { listRecentProgressByUser } from '@/src/services/courseProgress.service';

export type ContinueLearningSuggestion = {
  course: Course;
  progress: LessonProgress;
};

export function useContinueLearning(userId: string | undefined) {
  const [suggestion, setSuggestion] =
    useState<ContinueLearningSuggestion | null>(null);
  const [featured, setFeatured] = useState<Course | null>(null);
  const [featuredArticle, setFeaturedArticle] =
    useState<ContentArticle | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      if (userId) {
        const recent = await listRecentProgressByUser(userId, 30);
        const inProgress = recent.find((item) => !item.completed);
        if (inProgress) {
          const course = await getCourseById(inProgress.courseId);
          if (course && course.status === 'published') {
            setSuggestion({ course, progress: inProgress });
            setFeatured(null);
            setFeaturedArticle(null);
            return;
          }
        }
      }

      setSuggestion(null);
      const [publishedCourses, publishedArticles] = await Promise.all([
        listPublishedCourses(),
        listPublishedArticles(),
      ]);
      setFeatured(publishedCourses.courses[0] ?? null);
      setFeaturedArticle(publishedArticles.articles[0] ?? null);
    } catch {
      setSuggestion(null);
      setFeatured(null);
      setFeaturedArticle(null);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { suggestion, featured, featuredArticle, loading, refresh };
}
