export type CourseKind = 'curso' | 'mentoria';

export type CourseStatus =
  | 'draft'
  | 'pending_review'
  | 'published'
  | 'rejected';

export type LessonContentType = 'video' | 'text';

export type Course = {
  id: string;
  title: string;
  description: string;
  coverUrl: string | null;
  kind: CourseKind;
  status: CourseStatus;
  createdBy: string;
  createdByRole: 'admin' | 'profissional';
  submittedAt: Date | null;
  reviewedAt: Date | null;
  reviewedBy: string | null;
  rejectionReason: string | null;
  publishedAt: Date | null;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
};

export type CourseModule = {
  id: string;
  courseId: string;
  title: string;
  description: string;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
};

export type CourseLesson = {
  id: string;
  courseId: string;
  moduleId: string;
  title: string;
  description: string;
  sortOrder: number;
  contentType: LessonContentType;
  videoUrl: string | null;
  textBody: string | null;
  durationSeconds: number | null;
  createdAt: Date;
  updatedAt: Date;
};

export type CourseModuleWithLessons = CourseModule & {
  lessons: CourseLesson[];
};

export type CourseDetail = Course & {
  modules: CourseModuleWithLessons[];
};

export type LessonProgress = {
  id: string;
  userId: string;
  courseId: string;
  moduleId: string;
  lessonId: string;
  completed: boolean;
  completedAt: Date | null;
  lastViewedAt: Date;
};

export type CreateCourseInput = {
  title: string;
  description: string;
  coverUrl?: string | null;
  kind: CourseKind;
  sortOrder?: number;
  createdBy: string;
  createdByRole: 'admin' | 'profissional';
  /** Admin pode criar já published; profissional sempre draft. */
  status?: CourseStatus;
};

export type UpsertModuleInput = {
  courseId: string;
  moduleId?: string;
  title: string;
  description: string;
  sortOrder: number;
};

export type UpsertLessonInput = {
  courseId: string;
  moduleId: string;
  lessonId?: string;
  title: string;
  description: string;
  sortOrder: number;
  contentType: LessonContentType;
  videoUrl?: string | null;
  textBody?: string | null;
  durationSeconds?: number | null;
};

export type UpsertLessonProgressInput = {
  userId: string;
  courseId: string;
  moduleId: string;
  lessonId: string;
  completed: boolean;
};

const COURSE_STATUSES: readonly CourseStatus[] = [
  'draft',
  'pending_review',
  'published',
  'rejected',
] as const;

const COURSE_KINDS: readonly CourseKind[] = ['curso', 'mentoria'] as const;

export function isCourseStatus(value: unknown): value is CourseStatus {
  return (
    typeof value === 'string' &&
    (COURSE_STATUSES as readonly string[]).includes(value)
  );
}

export function isCourseKind(value: unknown): value is CourseKind {
  return (
    typeof value === 'string' &&
    (COURSE_KINDS as readonly string[]).includes(value)
  );
}

export function isLessonContentType(
  value: unknown,
): value is LessonContentType {
  return value === 'video' || value === 'text';
}

export function buildLessonProgressId(
  userId: string,
  lessonId: string,
): string {
  return `${userId}_${lessonId}`;
}

export function courseStatusLabel(status: CourseStatus): string {
  switch (status) {
    case 'draft':
      return 'Rascunho';
    case 'pending_review':
      return 'Em revisão';
    case 'published':
      return 'Publicado';
    case 'rejected':
      return 'Rejeitado';
    default: {
      const _exhaustive: never = status;
      return _exhaustive;
    }
  }
}
