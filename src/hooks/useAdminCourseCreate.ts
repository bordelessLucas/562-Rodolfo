import { useCallback, useState } from 'react';

import type { CourseKind } from '@/src/domain/course';
import { MOCK_VIDEO_URL } from '@/src/data/mockCourses';
import { useAuth } from '@/src/hooks/useAuth';
import {
  createCourse,
  upsertLesson,
  upsertModule,
} from '@/src/services/course.service';

export function useAdminCourseCreate() {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [kind, setKind] = useState<CourseKind>('curso');
  const [moduleTitle, setModuleTitle] = useState('Módulo 1');
  const [lessonTitle, setLessonTitle] = useState('Aula 1');
  const [videoUrl, setVideoUrl] = useState(MOCK_VIDEO_URL);
  const [sortOrder, setSortOrder] = useState('10');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const publish = useCallback(async () => {
    if (!user) {
      return;
    }
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const course = await createCourse({
        title,
        description,
        kind,
        sortOrder: Number(sortOrder) || 10,
        createdBy: user.uid,
        createdByRole: 'admin',
        status: 'published',
      });

      const mod = await upsertModule({
        courseId: course.id,
        moduleId: 'mod_principal',
        title: moduleTitle.trim() || 'Módulo 1',
        description: 'Módulo principal',
        sortOrder: 1,
      });

      await upsertLesson({
        courseId: course.id,
        moduleId: mod.id,
        lessonId: 'les_principal',
        title: lessonTitle.trim() || 'Aula 1',
        description: 'Videoaula com URL externa',
        sortOrder: 1,
        contentType: 'video',
        videoUrl,
        textBody: null,
        durationSeconds: 180,
      });

      setMessage(`Curso publicado: ${course.title}`);
      setTitle('');
      setDescription('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao publicar.');
    } finally {
      setLoading(false);
    }
  }, [
    user,
    title,
    description,
    kind,
    sortOrder,
    moduleTitle,
    lessonTitle,
    videoUrl,
  ]);

  return {
    title,
    setTitle,
    description,
    setDescription,
    kind,
    setKind,
    moduleTitle,
    setModuleTitle,
    lessonTitle,
    setLessonTitle,
    videoUrl,
    setVideoUrl,
    sortOrder,
    setSortOrder,
    loading,
    message,
    error,
    publish,
  };
}
