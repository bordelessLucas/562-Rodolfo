import { useCallback, useEffect, useMemo, useState } from 'react';

import type { ContentArticle } from '@/src/domain/article';
import { articleKindLabel } from '@/src/domain/article';
import type { Course } from '@/src/domain/course';
import { isCoursesDemoMode } from '@/src/config/coursesDemo';
import { listPublishedArticles } from '@/src/services/article.service';
import { listPublishedCourses } from '@/src/services/course.service';
import { matchesSearch } from '@/src/services/article.service';

export type ExploreFilter =
  | 'todos'
  | 'curso'
  | 'mentoria'
  | 'noticia'
  | 'pesquisa'
  | 'artigo';

export type ExploreListItem =
  | {
      key: string;
      type: 'course';
      course: Course;
      title: string;
      summary: string;
      badge: string;
    }
  | {
      key: string;
      type: 'article';
      article: ContentArticle;
      title: string;
      summary: string;
      badge: string;
    };

export function useExploreFeed() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [articles, setArticles] = useState<ContentArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usingDemo, setUsingDemo] = useState(false);
  const [queryText, setQueryText] = useState('');
  const [filter, setFilter] = useState<ExploreFilter>('todos');

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [courseResult, articleResult] = await Promise.all([
        listPublishedCourses(),
        listPublishedArticles(),
      ]);
      setCourses(courseResult.courses);
      setArticles(articleResult.articles);
      setUsingDemo(
        (courseResult.usedDemoFallback || articleResult.usedDemoFallback) &&
          isCoursesDemoMode(),
      );
    } catch (err) {
      setCourses([]);
      setArticles([]);
      setUsingDemo(false);
      setError(
        err instanceof Error
          ? err.message
          : 'Não foi possível carregar os conteúdos.',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const items: ExploreListItem[] = useMemo(() => {
    const courseItems: ExploreListItem[] = courses
      .filter((course) => {
        if (filter === 'todos') {
          return true;
        }
        if (filter === 'curso' || filter === 'mentoria') {
          return course.kind === filter;
        }
        return false;
      })
      .filter((course) => matchesSearch(course.title, queryText))
      .map((course) => ({
        key: `course-${course.id}`,
        type: 'course' as const,
        course,
        title: course.title,
        summary: course.description,
        badge: course.kind === 'mentoria' ? 'Mentoria' : 'Curso',
      }));

    const articleItems: ExploreListItem[] = articles
      .filter((article) => {
        if (filter === 'todos') {
          return true;
        }
        if (
          filter === 'noticia' ||
          filter === 'pesquisa' ||
          filter === 'artigo'
        ) {
          return article.kind === filter;
        }
        return false;
      })
      .filter((article) => matchesSearch(article.title, queryText))
      .map((article) => ({
        key: `article-${article.id}`,
        type: 'article' as const,
        article,
        title: article.title,
        summary: article.summary,
        badge: articleKindLabel(article.kind),
      }));

    return [...courseItems, ...articleItems];
  }, [courses, articles, filter, queryText]);

  return {
    items,
    loading,
    error,
    refresh,
    usingDemo,
    queryText,
    setQueryText,
    filter,
    setFilter,
  };
}
