import type {
  Course,
  CourseDetail,
  CourseKind,
  CourseLesson,
  CourseModuleWithLessons,
  CreateCourseInput,
  UpsertLessonInput,
  UpsertModuleInput,
} from '@/src/domain/course';

/**
 * Dados mock para seed e fallback local (URLs públicas — sem Firebase Storage).
 * Padrão de produto: `videoUrl` externa (YouTube/Vimeo/https). Ver `docs-ia/padrao_midia_externa.md`.
 * Placeholder de demonstração: Big Buck Bunny (domínio público).
 */
export const MOCK_VIDEO_URL =
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';

export type SeedCoursePayload = {
  id: string;
  course: Omit<CreateCourseInput, 'createdBy' | 'createdByRole' | 'status'> & {
    status: 'published' | 'pending_review';
    sortOrder: number;
  };
  modules: Array<{
    id: string;
    input: Omit<UpsertModuleInput, 'courseId' | 'moduleId'>;
    lessons: Array<{
      id: string;
      input: Omit<UpsertLessonInput, 'courseId' | 'moduleId' | 'lessonId'>;
    }>;
  }>;
};

export const MOCK_PUBLISHED_COURSES: SeedCoursePayload[] = [
  {
    id: 'seed_intro_lipedema',
    course: {
      title: 'Introdução ao lipedema',
      description:
        'Conteúdo educativo sobre conceitos básicos, sinais frequentes e cuidados iniciais. Material de apoio — não substitui consulta médica.',
      coverUrl: null,
      kind: 'curso' as CourseKind,
      status: 'published',
      sortOrder: 1,
    },
    modules: [
      {
        id: 'mod_conceitos',
        input: {
          title: 'Conceitos básicos',
          description:
            'O que é lipedema e como se diferencia de outros quadros.',
          sortOrder: 1,
        },
        lessons: [
          {
            id: 'les_o_que_e',
            input: {
              title: 'O que é lipedema?',
              description: 'Visão geral em vídeo.',
              sortOrder: 1,
              contentType: 'video',
              videoUrl: MOCK_VIDEO_URL,
              textBody: null,
              durationSeconds: 180,
            },
          },
          {
            id: 'les_sinais',
            input: {
              title: 'Principais sinais',
              description: 'Leitura educativa.',
              sortOrder: 2,
              contentType: 'text',
              videoUrl: null,
              textBody:
                'O lipedema é uma condição crônica que afeta a distribuição de gordura, comumente em membros inferiores. Este texto é material educativo de apoio e não substitui avaliação profissional.',
              durationSeconds: null,
            },
          },
        ],
      },
      {
        id: 'mod_cuidados',
        input: {
          title: 'Primeiros cuidados',
          description: 'Hábitos e orientações iniciais.',
          sortOrder: 2,
        },
        lessons: [
          {
            id: 'les_autocuidado',
            input: {
              title: 'Autocuidado no dia a dia',
              description: 'Orientações práticas em vídeo.',
              sortOrder: 1,
              contentType: 'video',
              videoUrl: MOCK_VIDEO_URL,
              textBody: null,
              durationSeconds: 240,
            },
          },
        ],
      },
    ],
  },
  {
    id: 'seed_mentoria_compressao',
    course: {
      title: 'Mentoria: compressão e rotina',
      description:
        'Série curta sobre uso de compressão e acompanhamento na rotina. Conteúdo educativo de apoio.',
      coverUrl: null,
      kind: 'mentoria' as CourseKind,
      status: 'published',
      sortOrder: 2,
    },
    modules: [
      {
        id: 'mod_compressao',
        input: {
          title: 'Compressão',
          description: 'Fundamentos práticos.',
          sortOrder: 1,
        },
        lessons: [
          {
            id: 'les_tipos_roupa',
            input: {
              title: 'Tipos de roupa de compressão',
              description: 'Videoaula introdutória.',
              sortOrder: 1,
              contentType: 'video',
              videoUrl: MOCK_VIDEO_URL,
              textBody: null,
              durationSeconds: 200,
            },
          },
        ],
      },
    ],
  },
];

/** Submissões pendentes para a fila de aprovação do admin (seed demo). */
export const MOCK_PENDING_COURSES: SeedCoursePayload[] = [
  {
    id: 'seed_pending_curso_edema',
    course: {
      title: '[Demo] Curso: edema e cuidados diários',
      description:
        'Submissão de demonstração aguardando aprovação. Conteúdo educativo sobre rotina e sinais de alerta.',
      coverUrl: null,
      kind: 'curso' as CourseKind,
      status: 'pending_review',
      sortOrder: 90,
    },
    modules: [
      {
        id: 'mod_rotina',
        input: {
          title: 'Rotina diária',
          description: 'Hábitos de apoio.',
          sortOrder: 1,
        },
        lessons: [
          {
            id: 'les_habitos',
            input: {
              title: 'Hábitos que ajudam no dia a dia',
              description: 'Videoaula demonstrativa.',
              sortOrder: 1,
              contentType: 'video',
              videoUrl: MOCK_VIDEO_URL,
              textBody: null,
              durationSeconds: 180,
            },
          },
        ],
      },
    ],
  },
  {
    id: 'seed_pending_mentoria_movimento',
    course: {
      title: '[Demo] Mentoria: movimento seguro',
      description:
        'Pedido de mentoria em demonstração (fila de revisão). Foco em caminhada e pausas ativas.',
      coverUrl: null,
      kind: 'mentoria' as CourseKind,
      status: 'pending_review',
      sortOrder: 91,
    },
    modules: [
      {
        id: 'mod_movimento',
        input: {
          title: 'Movimento',
          description: 'Orientações iniciais.',
          sortOrder: 1,
        },
        lessons: [
          {
            id: 'les_caminhada',
            input: {
              title: 'Caminhada com conforto',
              description: 'Videoaula demonstrativa.',
              sortOrder: 1,
              contentType: 'video',
              videoUrl: MOCK_VIDEO_URL,
              textBody: null,
              durationSeconds: 160,
            },
          },
        ],
      },
    ],
  },
];

const MOCK_NOW = new Date('2026-01-01T12:00:00.000Z');

function toCourse(seed: SeedCoursePayload): Course {
  return {
    id: seed.id,
    title: seed.course.title,
    description: seed.course.description,
    coverUrl: seed.course.coverUrl ?? null,
    kind: seed.course.kind,
    status: 'published',
    createdBy: 'mock_admin',
    createdByRole: 'admin',
    submittedAt: null,
    reviewedAt: MOCK_NOW,
    reviewedBy: 'mock_admin',
    rejectionReason: null,
    publishedAt: MOCK_NOW,
    sortOrder: seed.course.sortOrder,
    createdAt: MOCK_NOW,
    updatedAt: MOCK_NOW,
  };
}

/** Catálogo local quando Firestore ainda não tem cursos publicados. */
export function getLocalMockPublishedCourses(): Course[] {
  return MOCK_PUBLISHED_COURSES.map(toCourse);
}

export function getLocalMockCourseDetail(
  courseId: string,
): CourseDetail | null {
  const seed = MOCK_PUBLISHED_COURSES.find((item) => item.id === courseId);
  if (!seed) {
    return null;
  }

  const modules: CourseModuleWithLessons[] = seed.modules.map((mod) => ({
    id: mod.id,
    courseId: seed.id,
    title: mod.input.title,
    description: mod.input.description,
    sortOrder: mod.input.sortOrder,
    createdAt: MOCK_NOW,
    updatedAt: MOCK_NOW,
    lessons: mod.lessons.map((lesson) => ({
      id: lesson.id,
      courseId: seed.id,
      moduleId: mod.id,
      title: lesson.input.title,
      description: lesson.input.description,
      sortOrder: lesson.input.sortOrder,
      contentType: lesson.input.contentType,
      videoUrl: lesson.input.videoUrl ?? null,
      textBody: lesson.input.textBody ?? null,
      durationSeconds: lesson.input.durationSeconds ?? null,
      createdAt: MOCK_NOW,
      updatedAt: MOCK_NOW,
    })),
  }));

  return { ...toCourse(seed), modules };
}

export function getLocalMockLesson(
  courseId: string,
  moduleId: string,
  lessonId: string,
): CourseLesson | null {
  const detail = getLocalMockCourseDetail(courseId);
  if (!detail) {
    return null;
  }
  const mod = detail.modules.find((item) => item.id === moduleId);
  return mod?.lessons.find((item) => item.id === lessonId) ?? null;
}

export function isLocalMockCourseId(courseId: string): boolean {
  return (
    MOCK_PUBLISHED_COURSES.some((item) => item.id === courseId) ||
    MOCK_PENDING_COURSES.some((item) => item.id === courseId)
  );
}
