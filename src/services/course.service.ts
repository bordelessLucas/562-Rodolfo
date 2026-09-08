import {
  Timestamp,
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';

import {
  type Course,
  type CourseDetail,
  type CourseKind,
  type CourseLesson,
  type CourseModule,
  type CourseModuleWithLessons,
  type CourseStatus,
  type CreateCourseInput,
  type UpsertLessonInput,
  type UpsertModuleInput,
  isCourseKind,
  isCourseStatus,
  isLessonContentType,
} from '@/src/domain/course';
import { isCoursesDemoMode } from '@/src/config/coursesDemo';
import {
  MOCK_PUBLISHED_COURSES,
  getLocalMockCourseDetail,
  getLocalMockLesson,
  getLocalMockPublishedCourses,
  isLocalMockCourseId,
} from '@/src/data/mockCourses';
import { db } from '@/src/services/firebase';

const COURSES = 'courses';

export type PublishedCoursesResult = {
  courses: Course[];
  /** true quando o catálogo veio do mock local (modo demo explícito) */
  usedDemoFallback: boolean;
  demoReason?: 'empty' | 'error';
};

function asDate(value: unknown, fallback: Date): Date {
  return value instanceof Timestamp ? value.toDate() : fallback;
}

function asNullableDate(value: unknown): Date | null {
  return value instanceof Timestamp ? value.toDate() : null;
}

function mapCourse(id: string, data: Record<string, unknown>): Course | null {
  if (
    typeof data.title !== 'string' ||
    typeof data.description !== 'string' ||
    !isCourseKind(data.kind) ||
    !isCourseStatus(data.status) ||
    typeof data.createdBy !== 'string' ||
    (data.createdByRole !== 'admin' && data.createdByRole !== 'profissional') ||
    typeof data.sortOrder !== 'number'
  ) {
    return null;
  }

  const createdAt = asDate(data.createdAt, new Date());
  return {
    id,
    title: data.title,
    description: data.description,
    coverUrl: typeof data.coverUrl === 'string' ? data.coverUrl : null,
    kind: data.kind,
    status: data.status,
    createdBy: data.createdBy,
    createdByRole: data.createdByRole,
    submittedAt: asNullableDate(data.submittedAt),
    reviewedAt: asNullableDate(data.reviewedAt),
    reviewedBy: typeof data.reviewedBy === 'string' ? data.reviewedBy : null,
    rejectionReason:
      typeof data.rejectionReason === 'string' ? data.rejectionReason : null,
    publishedAt: asNullableDate(data.publishedAt),
    sortOrder: data.sortOrder,
    createdAt,
    updatedAt: asDate(data.updatedAt, createdAt),
  };
}

function mapModule(
  courseId: string,
  id: string,
  data: Record<string, unknown>,
): CourseModule | null {
  if (
    typeof data.title !== 'string' ||
    typeof data.description !== 'string' ||
    typeof data.sortOrder !== 'number'
  ) {
    return null;
  }
  const createdAt = asDate(data.createdAt, new Date());
  return {
    id,
    courseId,
    title: data.title,
    description: data.description,
    sortOrder: data.sortOrder,
    createdAt,
    updatedAt: asDate(data.updatedAt, createdAt),
  };
}

function mapLesson(
  courseId: string,
  moduleId: string,
  id: string,
  data: Record<string, unknown>,
): CourseLesson | null {
  if (
    typeof data.title !== 'string' ||
    typeof data.description !== 'string' ||
    typeof data.sortOrder !== 'number' ||
    !isLessonContentType(data.contentType)
  ) {
    return null;
  }
  const createdAt = asDate(data.createdAt, new Date());
  return {
    id,
    courseId,
    moduleId,
    title: data.title,
    description: data.description,
    sortOrder: data.sortOrder,
    contentType: data.contentType,
    videoUrl: typeof data.videoUrl === 'string' ? data.videoUrl : null,
    textBody: typeof data.textBody === 'string' ? data.textBody : null,
    durationSeconds:
      typeof data.durationSeconds === 'number' ? data.durationSeconds : null,
    createdAt,
    updatedAt: asDate(data.updatedAt, createdAt),
  };
}

function courseRef(courseId: string) {
  return doc(db, COURSES, courseId);
}

function modulesCol(courseId: string) {
  return collection(db, COURSES, courseId, 'modules');
}

function lessonsCol(courseId: string, moduleId: string) {
  return collection(db, COURSES, courseId, 'modules', moduleId, 'lessons');
}

export async function getCourseById(courseId: string): Promise<Course | null> {
  const snapshot = await getDoc(courseRef(courseId));
  if (!snapshot.exists()) {
    return null;
  }
  return mapCourse(snapshot.id, snapshot.data() as Record<string, unknown>);
}

export async function listPublishedCourses(): Promise<PublishedCoursesResult> {
  try {
    const snapshot = await getDocs(
      query(
        collection(db, COURSES),
        where('status', '==', 'published'),
        orderBy('sortOrder', 'asc'),
      ),
    );

    const items: Course[] = [];
    snapshot.forEach((item) => {
      const mapped = mapCourse(item.id, item.data() as Record<string, unknown>);
      if (mapped) {
        items.push(mapped);
      }
    });

    if (items.length > 0) {
      return { courses: items, usedDemoFallback: false };
    }

    if (isCoursesDemoMode()) {
      return {
        courses: getLocalMockPublishedCourses(),
        usedDemoFallback: true,
        demoReason: 'empty',
      };
    }

    return { courses: [], usedDemoFallback: false };
  } catch (err) {
    if (isCoursesDemoMode()) {
      return {
        courses: getLocalMockPublishedCourses(),
        usedDemoFallback: true,
        demoReason: 'error',
      };
    }
    throw err instanceof Error
      ? err
      : new Error('Não foi possível carregar os cursos publicados.');
  }
}

export async function listCoursesByStatus(
  status: CourseStatus,
): Promise<Course[]> {
  const snapshot = await getDocs(
    query(
      collection(db, COURSES),
      where('status', '==', status),
      orderBy('submittedAt', 'desc'),
    ),
  );

  const items: Course[] = [];
  snapshot.forEach((item) => {
    const mapped = mapCourse(item.id, item.data() as Record<string, unknown>);
    if (mapped) {
      items.push(mapped);
    }
  });
  return items;
}

export async function listCoursesByCreator(
  createdBy: string,
): Promise<Course[]> {
  const snapshot = await getDocs(
    query(
      collection(db, COURSES),
      where('createdBy', '==', createdBy),
      orderBy('updatedAt', 'desc'),
    ),
  );

  const items: Course[] = [];
  snapshot.forEach((item) => {
    const mapped = mapCourse(item.id, item.data() as Record<string, unknown>);
    if (mapped) {
      items.push(mapped);
    }
  });
  return items;
}

export async function listModules(courseId: string): Promise<CourseModule[]> {
  const snapshot = await getDocs(
    query(modulesCol(courseId), orderBy('sortOrder', 'asc')),
  );
  const items: CourseModule[] = [];
  snapshot.forEach((item) => {
    const mapped = mapModule(
      courseId,
      item.id,
      item.data() as Record<string, unknown>,
    );
    if (mapped) {
      items.push(mapped);
    }
  });
  return items;
}

export async function listLessons(
  courseId: string,
  moduleId: string,
): Promise<CourseLesson[]> {
  const snapshot = await getDocs(
    query(lessonsCol(courseId, moduleId), orderBy('sortOrder', 'asc')),
  );
  const items: CourseLesson[] = [];
  snapshot.forEach((item) => {
    const mapped = mapLesson(
      courseId,
      moduleId,
      item.id,
      item.data() as Record<string, unknown>,
    );
    if (mapped) {
      items.push(mapped);
    }
  });
  return items;
}

export async function getCourseDetail(
  courseId: string,
): Promise<CourseDetail | null> {
  try {
    const snapshot = await getDoc(courseRef(courseId));
    if (snapshot.exists()) {
      const course = mapCourse(
        snapshot.id,
        snapshot.data() as Record<string, unknown>,
      );
      if (!course) {
        return null;
      }
      const modules = await listModules(courseId);
      const withLessons: CourseModuleWithLessons[] = [];

      for (const mod of modules) {
        const lessons = await listLessons(courseId, mod.id);
        withLessons.push({ ...mod, lessons });
      }

      return { ...course, modules: withLessons };
    }

    // Documento inexistente: mock só para IDs conhecidos em modo demo.
    if (isCoursesDemoMode() && isLocalMockCourseId(courseId)) {
      return getLocalMockCourseDetail(courseId);
    }
    return null;
  } catch (err) {
    // Erro de rede/permissão: não mascarar com mock.
    throw err instanceof Error
      ? err
      : new Error('Não foi possível carregar o curso.');
  }
}

export async function getLesson(
  courseId: string,
  moduleId: string,
  lessonId: string,
): Promise<CourseLesson | null> {
  try {
    const snapshot = await getDoc(
      doc(db, COURSES, courseId, 'modules', moduleId, 'lessons', lessonId),
    );
    if (snapshot.exists()) {
      return mapLesson(
        courseId,
        moduleId,
        snapshot.id,
        snapshot.data() as Record<string, unknown>,
      );
    }

    if (
      isCoursesDemoMode() &&
      isLocalMockCourseId(courseId) &&
      getLocalMockLesson(courseId, moduleId, lessonId)
    ) {
      return getLocalMockLesson(courseId, moduleId, lessonId);
    }
    return null;
  } catch (err) {
    throw err instanceof Error
      ? err
      : new Error('Não foi possível carregar a aula.');
  }
}

export async function createCourse(
  input: CreateCourseInput,
  courseId?: string,
): Promise<Course> {
  const title = input.title.trim();
  const description = input.description.trim();
  if (!title) {
    throw new Error('Informe o título do curso.');
  }

  const status: CourseStatus =
    input.createdByRole === 'admin'
      ? (input.status ?? 'draft')
      : 'draft';

  if (input.createdByRole === 'profissional' && status !== 'draft') {
    throw new Error('Profissional só pode criar cursos em rascunho.');
  }

  const ref = courseId ? courseRef(courseId) : doc(collection(db, COURSES));
  const payload = {
    title,
    description,
    coverUrl: input.coverUrl?.trim() || null,
    kind: input.kind,
    status,
    createdBy: input.createdBy,
    createdByRole: input.createdByRole,
    submittedAt: null,
    reviewedAt: null,
    reviewedBy: null,
    rejectionReason: null,
    publishedAt: status === 'published' ? serverTimestamp() : null,
    sortOrder: input.sortOrder ?? 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  await setDoc(ref, payload);
  const saved = await getCourseById(ref.id);
  if (!saved) {
    throw new Error('Não foi possível carregar o curso criado.');
  }
  return saved;
}

export async function updateCourseMeta(
  courseId: string,
  patch: {
    title?: string;
    description?: string;
    coverUrl?: string | null;
    kind?: CourseKind;
    sortOrder?: number;
  },
): Promise<Course> {
  const existing = await getCourseById(courseId);
  if (!existing) {
    throw new Error('Curso não encontrado.');
  }

  await updateDoc(courseRef(courseId), {
    ...(patch.title !== undefined ? { title: patch.title.trim() } : {}),
    ...(patch.description !== undefined
      ? { description: patch.description.trim() }
      : {}),
    ...(patch.coverUrl !== undefined
      ? { coverUrl: patch.coverUrl?.trim() || null }
      : {}),
    ...(patch.kind !== undefined ? { kind: patch.kind } : {}),
    ...(patch.sortOrder !== undefined ? { sortOrder: patch.sortOrder } : {}),
    updatedAt: serverTimestamp(),
  });

  const saved = await getCourseById(courseId);
  if (!saved) {
    throw new Error('Não foi possível carregar o curso atualizado.');
  }
  return saved;
}

export async function upsertModule(
  input: UpsertModuleInput,
): Promise<CourseModule> {
  const title = input.title.trim();
  if (!title) {
    throw new Error('Informe o título do módulo.');
  }

  const ref = input.moduleId
    ? doc(modulesCol(input.courseId), input.moduleId)
    : doc(modulesCol(input.courseId));

  const existing = await getDoc(ref);
  await setDoc(
    ref,
    {
      title,
      description: input.description.trim(),
      sortOrder: input.sortOrder,
      updatedAt: serverTimestamp(),
      ...(existing.exists() ? {} : { createdAt: serverTimestamp() }),
    },
    { merge: true },
  );

  const snapshot = await getDoc(ref);
  const mapped = mapModule(
    input.courseId,
    snapshot.id,
    snapshot.data() as Record<string, unknown>,
  );
  if (!mapped) {
    throw new Error('Não foi possível carregar o módulo.');
  }
  return mapped;
}

export async function upsertLesson(
  input: UpsertLessonInput,
): Promise<CourseLesson> {
  const title = input.title.trim();
  if (!title) {
    throw new Error('Informe o título da aula.');
  }

  const ref = input.lessonId
    ? doc(lessonsCol(input.courseId, input.moduleId), input.lessonId)
    : doc(lessonsCol(input.courseId, input.moduleId));

  const existing = await getDoc(ref);
  await setDoc(
    ref,
    {
      title,
      description: input.description.trim(),
      sortOrder: input.sortOrder,
      contentType: input.contentType,
      videoUrl: input.videoUrl?.trim() || null,
      textBody: input.textBody?.trim() || null,
      durationSeconds:
        typeof input.durationSeconds === 'number'
          ? input.durationSeconds
          : null,
      updatedAt: serverTimestamp(),
      ...(existing.exists() ? {} : { createdAt: serverTimestamp() }),
    },
    { merge: true },
  );

  const snapshot = await getDoc(ref);
  const mapped = mapLesson(
    input.courseId,
    input.moduleId,
    snapshot.id,
    snapshot.data() as Record<string, unknown>,
  );
  if (!mapped) {
    throw new Error('Não foi possível carregar a aula.');
  }
  return mapped;
}

export async function submitCourseForReview(courseId: string): Promise<Course> {
  const course = await getCourseById(courseId);
  if (!course) {
    throw new Error('Curso não encontrado.');
  }
  if (course.status !== 'draft' && course.status !== 'rejected') {
    throw new Error('Só é possível enviar rascunhos ou cursos rejeitados.');
  }

  await updateDoc(courseRef(courseId), {
    status: 'pending_review',
    submittedAt: serverTimestamp(),
    rejectionReason: null,
    updatedAt: serverTimestamp(),
  });

  const saved = await getCourseById(courseId);
  if (!saved) {
    throw new Error('Não foi possível carregar o curso enviado.');
  }
  return saved;
}

export async function approveCourse(
  courseId: string,
  adminId: string,
): Promise<Course> {
  const course = await getCourseById(courseId);
  if (!course) {
    throw new Error('Curso não encontrado.');
  }
  if (course.status !== 'pending_review') {
    throw new Error(
      'Só é possível aprovar cursos que estão aguardando revisão.',
    );
  }

  await updateDoc(courseRef(courseId), {
    status: 'published',
    reviewedAt: serverTimestamp(),
    reviewedBy: adminId,
    rejectionReason: null,
    publishedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  const saved = await getCourseById(courseId);
  if (!saved) {
    throw new Error('Não foi possível carregar o curso aprovado.');
  }
  return saved;
}

export async function rejectCourse(
  courseId: string,
  adminId: string,
  reason: string,
): Promise<Course> {
  const trimmed = reason.trim();
  if (!trimmed) {
    throw new Error('Informe o motivo da rejeição.');
  }

  const course = await getCourseById(courseId);
  if (!course) {
    throw new Error('Curso não encontrado.');
  }
  if (course.status !== 'pending_review') {
    throw new Error(
      'Só é possível rejeitar cursos que estão aguardando revisão.',
    );
  }

  await updateDoc(courseRef(courseId), {
    status: 'rejected',
    reviewedAt: serverTimestamp(),
    reviewedBy: adminId,
    rejectionReason: trimmed,
    updatedAt: serverTimestamp(),
  });

  const saved = await getCourseById(courseId);
  if (!saved) {
    throw new Error('Não foi possível carregar o curso rejeitado.');
  }
  return saved;
}

export async function publishCourseDirect(
  courseId: string,
  adminId: string,
): Promise<Course> {
  const course = await getCourseById(courseId);
  if (!course) {
    throw new Error('Curso não encontrado.');
  }
  if (course.status === 'published') {
    return course;
  }
  if (course.status !== 'pending_review') {
    throw new Error(
      'Publicação direta só é permitida para cursos em revisão. Use aprovação da fila.',
    );
  }
  return approveCourse(courseId, adminId);
}

/**
 * Grava cursos mock published (idempotente por IDs fixos).
 * Requer usuário admin autenticado (rules).
 */
export async function seedPublishedMockCourses(
  adminUid: string,
): Promise<{ created: number; skipped: number }> {
  let created = 0;
  let skipped = 0;

  for (const seed of MOCK_PUBLISHED_COURSES) {
    const existing = await getCourseById(seed.id);
    if (existing) {
      skipped += 1;
      continue;
    }

    await createCourse(
      {
        title: seed.course.title,
        description: seed.course.description,
        coverUrl: seed.course.coverUrl,
        kind: seed.course.kind,
        sortOrder: seed.course.sortOrder,
        createdBy: adminUid,
        createdByRole: 'admin',
        status: 'published',
      },
      seed.id,
    );

    for (const mod of seed.modules) {
      await upsertModule({
        courseId: seed.id,
        moduleId: mod.id,
        ...mod.input,
      });
      for (const lesson of mod.lessons) {
        await upsertLesson({
          courseId: seed.id,
          moduleId: mod.id,
          lessonId: lesson.id,
          ...lesson.input,
        });
      }
    }
    created += 1;
  }

  return { created, skipped };
}
