import {
  Timestamp,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where,
} from 'firebase/firestore';

import {
  type LessonProgress,
  type UpsertLessonProgressInput,
  buildLessonProgressId,
} from '@/src/domain/course';
import { db } from '@/src/services/firebase';

const COLLECTION = 'lessonProgress';

function mapProgress(
  id: string,
  data: Record<string, unknown>,
): LessonProgress | null {
  if (
    typeof data.userId !== 'string' ||
    typeof data.courseId !== 'string' ||
    typeof data.moduleId !== 'string' ||
    typeof data.lessonId !== 'string' ||
    typeof data.completed !== 'boolean'
  ) {
    return null;
  }

  return {
    id,
    userId: data.userId,
    courseId: data.courseId,
    moduleId: data.moduleId,
    lessonId: data.lessonId,
    completed: data.completed,
    completedAt:
      data.completedAt instanceof Timestamp ? data.completedAt.toDate() : null,
    lastViewedAt:
      data.lastViewedAt instanceof Timestamp
        ? data.lastViewedAt.toDate()
        : new Date(),
  };
}

export async function getLessonProgress(
  userId: string,
  lessonId: string,
): Promise<LessonProgress | null> {
  const id = buildLessonProgressId(userId, lessonId);
  const snapshot = await getDoc(doc(db, COLLECTION, id));
  if (!snapshot.exists()) {
    return null;
  }
  return mapProgress(snapshot.id, snapshot.data() as Record<string, unknown>);
}

export async function listProgressByCourse(
  userId: string,
  courseId: string,
): Promise<LessonProgress[]> {
  const snapshot = await getDocs(
    query(
      collection(db, COLLECTION),
      where('userId', '==', userId),
      where('courseId', '==', courseId),
    ),
  );

  const items: LessonProgress[] = [];
  snapshot.forEach((item) => {
    const mapped = mapProgress(
      item.id,
      item.data() as Record<string, unknown>,
    );
    if (mapped) {
      items.push(mapped);
    }
  });
  return items;
}

export async function upsertLessonProgress(
  input: UpsertLessonProgressInput,
): Promise<LessonProgress> {
  const id = buildLessonProgressId(input.userId, input.lessonId);
  const ref = doc(db, COLLECTION, id);
  const existing = await getDoc(ref);

  const alreadyCompleted =
    existing.exists() &&
    (existing.data() as Record<string, unknown>).completed === true;

  await setDoc(
    ref,
    {
      userId: input.userId,
      courseId: input.courseId,
      moduleId: input.moduleId,
      lessonId: input.lessonId,
      completed: input.completed || alreadyCompleted,
      lastViewedAt: serverTimestamp(),
      ...(input.completed || alreadyCompleted
        ? {
            completedAt:
              alreadyCompleted && existing.exists()
                ? (existing.data() as Record<string, unknown>).completedAt ??
                  serverTimestamp()
                : serverTimestamp(),
          }
        : { completedAt: null }),
      ...(existing.exists() ? {} : {}),
    },
    { merge: true },
  );

  const saved = await getLessonProgress(input.userId, input.lessonId);
  if (!saved) {
    throw new Error('Não foi possível carregar o progresso da aula.');
  }
  return saved;
}

export async function listRecentProgressByUser(
  userId: string,
  maxItems = 20,
): Promise<LessonProgress[]> {
  const snapshot = await getDocs(
    query(collection(db, COLLECTION), where('userId', '==', userId)),
  );

  const items: LessonProgress[] = [];
  snapshot.forEach((item) => {
    const mapped = mapProgress(
      item.id,
      item.data() as Record<string, unknown>,
    );
    if (mapped) {
      items.push(mapped);
    }
  });

  items.sort((a, b) => b.lastViewedAt.getTime() - a.lastViewedAt.getTime());
  return items.slice(0, maxItems);
}

export async function markLessonViewed(
  input: Omit<UpsertLessonProgressInput, 'completed'> & {
    completed?: boolean;
  },
): Promise<LessonProgress> {
  return upsertLessonProgress({
    ...input,
    completed: input.completed ?? false,
  });
}
