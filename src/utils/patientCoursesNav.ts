/** Rotas de cursos do paciente (aninhadas sob Explorar). */
export const PATIENT_COURSES_HREF = '/(paciente)/descobrir/cursos' as const;

export function patientCourseHref(courseId: string): string {
  return `${PATIENT_COURSES_HREF}/${courseId}`;
}

export function patientLessonHref(
  courseId: string,
  lessonId: string,
  moduleId: string,
): string {
  return `${PATIENT_COURSES_HREF}/${courseId}/aulas/${lessonId}?moduleId=${encodeURIComponent(moduleId)}`;
}
