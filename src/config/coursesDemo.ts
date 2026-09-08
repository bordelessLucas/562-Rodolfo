/**
 * Demo/mock de cursos só com flag explícita.
 * - `EXPO_PUBLIC_COURSES_DEMO_MODE=true` → sempre permite fallback local
 * - `EXPO_PUBLIC_COURSES_DEMO_MODE=false` → nunca usa mock (empty/erro honestos)
 * - ausente → em `__DEV__` permite demo; em produção exige Firestore/seed
 */
export function isCoursesDemoMode(): boolean {
  const flag = process.env.EXPO_PUBLIC_COURSES_DEMO_MODE;
  if (flag === 'true') {
    return true;
  }
  if (flag === 'false') {
    return false;
  }
  return typeof __DEV__ !== 'undefined' && __DEV__;
}
