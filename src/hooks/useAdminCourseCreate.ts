import { useCallback, useState } from 'react';

import type { CourseKind } from '@/src/domain/course';
import { useAuth } from '@/src/hooks/useAuth';
import {
  createCourse,
  upsertLesson,
  upsertModule,
} from '@/src/services/course.service';
import {
  parseExternalVideoUrl,
  requireExternalVideoUrl,
} from '@/src/utils/externalVideoUrl';

export type AdminCoursePublishResult =
  | { ok: true; title: string; kind: CourseKind }
  | { ok: false; error: string };

export function useAdminCourseCreate() {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [kind, setKind] = useState<CourseKind>('curso');
  const [moduleTitle, setModuleTitle] = useState('Módulo 1');
  const [lessonTitle, setLessonTitle] = useState('Aula 1');
  const [videoUrl, setVideoUrl] = useState('');
  const [sortOrder, setSortOrder] = useState('10');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const publish = useCallback(async (): Promise<AdminCoursePublishResult> => {
    if (!user) {
      return { ok: false, error: 'Faça login novamente.' };
    }
    if (!title.trim()) {
      const message = 'Informe o título do curso.';
      setError(message);
      return { ok: false, error: message };
    }
    const videoCheck = parseExternalVideoUrl(videoUrl);
    if (!videoCheck.ok) {
      const message =
        videoCheck.error ??
        'Informe uma URL de vídeo válida (YouTube, Vimeo ou https).';
      setError(message);
      return { ok: false, error: message };
    }

    setLoading(true);
    setError('');
    try {
      const normalizedVideoUrl = requireExternalVideoUrl(videoUrl);
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
        videoUrl: normalizedVideoUrl,
        textBody: null,
        durationSeconds: 180,
      });

      return { ok: true, title: course.title, kind };
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Falha ao publicar.';
      setError(message);
      return { ok: false, error: message };
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
    error,
    publish,
  };
}
