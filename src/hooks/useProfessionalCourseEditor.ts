import { useLocalSearchParams, useRouter, type Href } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';

import type { CourseKind, CourseStatus } from '@/src/domain/course';
import { courseStatusLabel } from '@/src/domain/course';
import { useAuth } from '@/src/hooks/useAuth';
import {
  createCourse,
  getCourseDetail,
  submitCourseForReview,
  updateCourseMeta,
  upsertLesson,
  upsertModule,
} from '@/src/services/course.service';
import {
  EXTERNAL_VIDEO_PLACEHOLDER,
  parseExternalVideoUrl,
  requireExternalVideoUrl,
} from '@/src/utils/externalVideoUrl';
import { firstParam } from '@/src/utils/routeParams';

const DEFAULT_MODULE_ID = 'mod_principal';
const DEFAULT_LESSON_ID = 'les_principal';

function canEditCourseContent(status: CourseStatus): boolean {
  return status === 'draft' || status === 'rejected';
}

export function useProfessionalCourseEditor() {
  const router = useRouter();
  const params = useLocalSearchParams<{ courseId?: string | string[] }>();
  const courseIdParam = firstParam(params.courseId);
  const isNew = !courseIdParam || courseIdParam === 'novo';
  const { user } = useAuth();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [kind, setKind] = useState<CourseKind>('curso');
  const [moduleId, setModuleId] = useState(DEFAULT_MODULE_ID);
  const [lessonId, setLessonId] = useState(DEFAULT_LESSON_ID);
  const [moduleTitle, setModuleTitle] = useState('Módulo 1');
  const [lessonTitle, setLessonTitle] = useState('Aula 1');
  const [videoUrl, setVideoUrl] = useState('');
  const [savedCourseId, setSavedCourseId] = useState<string | null>(
    isNew ? null : courseIdParam,
  );
  const [status, setStatus] = useState<CourseStatus>('draft');
  const [loading, setLoading] = useState(false);
  const [hydrating, setHydrating] = useState(!isNew);
  const [contentReady, setContentReady] = useState(isNew);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const editable = useMemo(() => canEditCourseContent(status), [status]);

  useEffect(() => {
    if (isNew || !courseIdParam) {
      setHydrating(false);
      setContentReady(true);
      return;
    }

    let cancelled = false;
    void (async () => {
      setHydrating(true);
      setError('');
      try {
        const detail = await getCourseDetail(courseIdParam);
        if (cancelled) {
          return;
        }
        if (!detail) {
          setError('Curso não encontrado.');
          setContentReady(false);
          return;
        }

        setTitle(detail.title);
        setDescription(detail.description);
        setKind(detail.kind);
        setStatus(detail.status);
        setSavedCourseId(detail.id);

        const preferredModule =
          detail.modules.find((mod) => mod.id === DEFAULT_MODULE_ID) ??
          detail.modules[0];
        if (preferredModule) {
          setModuleId(preferredModule.id);
          setModuleTitle(preferredModule.title);

          const preferredLesson =
            preferredModule.lessons.find(
              (lesson) => lesson.id === DEFAULT_LESSON_ID,
            ) ?? preferredModule.lessons[0];
          if (preferredLesson) {
            setLessonId(preferredLesson.id);
            setLessonTitle(preferredLesson.title);
            setVideoUrl(preferredLesson.videoUrl ?? '');
          } else {
            setLessonId(DEFAULT_LESSON_ID);
            setLessonTitle('Aula 1');
            setVideoUrl('');
          }
        } else {
          setModuleId(DEFAULT_MODULE_ID);
          setLessonId(DEFAULT_LESSON_ID);
          setModuleTitle('Módulo 1');
          setLessonTitle('Aula 1');
          setVideoUrl('');
        }
        setContentReady(true);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : 'Falha ao carregar o curso.',
          );
          setContentReady(false);
        }
      } finally {
        if (!cancelled) {
          setHydrating(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [courseIdParam, isNew]);

  const saveDraft = useCallback(async () => {
    if (!user) {
      return;
    }
    if (!editable) {
      setError(
        status === 'pending_review'
          ? 'Curso aguardando revisão — edição bloqueada até a decisão do administrador.'
          : 'Este curso não pode ser editado no status atual.',
      );
      return;
    }
    if (!isNew && !contentReady) {
      setError('Aguarde o carregamento do conteúdo antes de salvar.');
      return;
    }
    if (!title.trim()) {
      setError('Informe o título do curso.');
      return;
    }

    const videoCheck = parseExternalVideoUrl(videoUrl);
    if (!videoCheck.ok) {
      setError(
        videoCheck.error ??
          'Informe uma URL de vídeo válida (YouTube, Vimeo ou https).',
      );
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');
    try {
      const normalizedVideoUrl = requireExternalVideoUrl(videoUrl);
      let id = savedCourseId;
      const createdNew = !id;
      if (!id) {
        const created = await createCourse({
          title,
          description,
          kind,
          createdBy: user.uid,
          createdByRole: 'profissional',
          status: 'draft',
        });
        id = created.id;
        setSavedCourseId(id);
        setStatus(created.status);
      } else {
        const updated = await updateCourseMeta(id, {
          title,
          description,
          kind,
        });
        setStatus(updated.status);
      }

      const mod = await upsertModule({
        courseId: id,
        moduleId,
        title: moduleTitle.trim() || 'Módulo 1',
        description: 'Módulo principal do curso',
        sortOrder: 1,
      });

      await upsertLesson({
        courseId: id,
        moduleId: mod.id,
        lessonId,
        title: lessonTitle.trim() || 'Aula 1',
        description: 'Videoaula com URL externa',
        sortOrder: 1,
        contentType: 'video',
        videoUrl: normalizedVideoUrl,
        textBody: null,
        durationSeconds: 180,
      });

      setModuleId(mod.id);
      setMessage('Rascunho salvo com módulo e aula.');

      if (createdNew) {
        router.replace(`/(profissional)/cursos/${id}` as Href);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao salvar.');
    } finally {
      setLoading(false);
    }
  }, [
    user,
    editable,
    status,
    isNew,
    contentReady,
    savedCourseId,
    title,
    description,
    kind,
    moduleId,
    lessonId,
    moduleTitle,
    lessonTitle,
    videoUrl,
    router,
  ]);

  const submit = useCallback(async () => {
    if (!savedCourseId) {
      setError('Salve o rascunho antes de enviar para revisão.');
      return;
    }
    if (!editable) {
      setError('Só é possível enviar rascunhos ou cursos rejeitados.');
      return;
    }
    const videoCheck = parseExternalVideoUrl(videoUrl);
    if (!videoCheck.ok) {
      setError(
        'Salve uma URL de vídeo válida antes de enviar para aprovação.',
      );
      return;
    }
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const updated = await submitCourseForReview(savedCourseId);
      setStatus(updated.status);
      setMessage(
        'Enviado para aprovação do administrador. Acompanhe em Meus cursos.',
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao enviar.');
    } finally {
      setLoading(false);
    }
  }, [savedCourseId, editable, videoUrl]);

  return {
    isNew,
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
    savedCourseId,
    status,
    statusLabel: courseStatusLabel(status),
    editable,
    /** Aliases usados pela tela (Sprint Continuity / Fix em paralelo). */
    canEditContent: editable,
    hydrating,
    loadingCourse: hydrating,
    contentReady,
    contentHydrated: contentReady,
    loading,
    message,
    error,
    saveDraft,
    submit,
    goBack: () => router.back(),
    goToMyCourses: () => router.replace('/(profissional)/cursos' as Href),
  };
}
