import {
  Timestamp,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  where,
} from 'firebase/firestore';

import {
  type BodyMeasurements,
  type DailyCheckin,
  type UpsertDailyCheckinInput,
  type WellbeingScores,
  buildCheckinId,
  createEmptyMeasurements,
  createEmptyWellbeing,
} from '@/src/domain/checkin';
import { db } from '@/src/services/firebase';

function asNumberOrNull(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === 'string');
}

function mapWellbeing(value: unknown): WellbeingScores {
  if (typeof value !== 'object' || value === null) {
    return createEmptyWellbeing();
  }

  const data = value as Record<string, unknown>;
  return {
    pain: asNumberOrNull(data.pain),
    heaviness: asNumberOrNull(data.heaviness),
    energy: asNumberOrNull(data.energy),
    mood: asNumberOrNull(data.mood),
  };
}

function mapMeasurements(value: unknown): BodyMeasurements {
  if (typeof value !== 'object' || value === null) {
    return createEmptyMeasurements();
  }

  const data = value as Record<string, unknown>;
  return {
    ankleLeft: asNumberOrNull(data.ankleLeft),
    ankleRight: asNumberOrNull(data.ankleRight),
    calfLeft: asNumberOrNull(data.calfLeft),
    calfRight: asNumberOrNull(data.calfRight),
    kneeLeft: asNumberOrNull(data.kneeLeft),
    kneeRight: asNumberOrNull(data.kneeRight),
    thighLeft: asNumberOrNull(data.thighLeft),
    thighRight: asNumberOrNull(data.thighRight),
    upperArmLeft: asNumberOrNull(data.upperArmLeft),
    upperArmRight: asNumberOrNull(data.upperArmRight),
    weight: asNumberOrNull(data.weight),
  };
}

function mapCheckin(
  id: string,
  data: Record<string, unknown>,
): DailyCheckin | null {
  if (typeof data.userId !== 'string' || typeof data.date !== 'string') {
    return null;
  }

  const createdAt =
    data.createdAt instanceof Timestamp
      ? data.createdAt.toDate()
      : new Date();
  const updatedAt =
    data.updatedAt instanceof Timestamp
      ? data.updatedAt.toDate()
      : createdAt;

  return {
    id,
    userId: data.userId,
    date: data.date,
    treatments: asStringArray(data.treatments),
    activities: asStringArray(data.activities),
    lifestyle: asStringArray(data.lifestyle),
    supplements: asStringArray(data.supplements),
    medications: asStringArray(data.medications),
    wellbeing: mapWellbeing(data.wellbeing),
    measurements: mapMeasurements(data.measurements),
    notes: typeof data.notes === 'string' ? data.notes : '',
    createdAt,
    updatedAt,
  };
}

export async function getCheckinByDate(
  userId: string,
  date: string,
): Promise<DailyCheckin | null> {
  const id = buildCheckinId(userId, date);
  const snapshot = await getDoc(doc(db, 'dailyCheckins', id));

  if (!snapshot.exists()) {
    return null;
  }

  return mapCheckin(snapshot.id, snapshot.data() as Record<string, unknown>);
}

export async function upsertCheckin(
  input: UpsertDailyCheckinInput,
): Promise<DailyCheckin> {
  const id = buildCheckinId(input.userId, input.date);
  const ref = doc(db, 'dailyCheckins', id);
  const existing = await getDoc(ref);

  const payload = {
    userId: input.userId,
    date: input.date,
    treatments: input.treatments,
    activities: input.activities,
    lifestyle: input.lifestyle,
    supplements: input.supplements,
    medications: input.medications,
    wellbeing: input.wellbeing,
    measurements: input.measurements,
    notes: input.notes.trim(),
    updatedAt: serverTimestamp(),
    ...(existing.exists() ? {} : { createdAt: serverTimestamp() }),
  };

  await setDoc(ref, payload, { merge: true });

  const saved = await getCheckinByDate(input.userId, input.date);
  if (!saved) {
    throw new Error('Não foi possível carregar o check-in salvo.');
  }

  return saved;
}

export async function listCheckinsByUser(
  userId: string,
  maxItems = 60,
): Promise<DailyCheckin[]> {
  const checkinsQuery = query(
    collection(db, 'dailyCheckins'),
    where('userId', '==', userId),
    orderBy('date', 'desc'),
    limit(maxItems),
  );

  const snapshot = await getDocs(checkinsQuery);
  const items: DailyCheckin[] = [];

  snapshot.forEach((item) => {
    const mapped = mapCheckin(
      item.id,
      item.data() as Record<string, unknown>,
    );
    if (mapped) {
      items.push(mapped);
    }
  });

  return items;
}
