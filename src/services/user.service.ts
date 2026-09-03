import {
  Timestamp,
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';

import type { CreateUserProfileInput, UserProfile, UserRole } from '@/src/domain/user';
import { db } from '@/src/services/firebase';

function isUserRole(value: unknown): value is UserRole {
  return value === 'paciente' || value === 'profissional';
}

export async function createUserProfile(
  input: CreateUserProfileInput,
): Promise<void> {
  const ref = doc(db, 'users', input.uid);

  await setDoc(ref, {
    uid: input.uid,
    name: input.name.trim(),
    email: input.email.trim().toLowerCase(),
    role: input.role,
    createdAt: serverTimestamp(),
  });
}

export async function getUserProfile(
  uid: string,
): Promise<UserProfile | null> {
  const snapshot = await getDoc(doc(db, 'users', uid));

  if (!snapshot.exists()) {
    return null;
  }

  const data = snapshot.data();
  const createdAtRaw = data.createdAt;
  const createdAt =
    createdAtRaw instanceof Timestamp
      ? createdAtRaw.toDate()
      : new Date();

  if (
    typeof data.uid !== 'string' ||
    typeof data.name !== 'string' ||
    typeof data.email !== 'string' ||
    !isUserRole(data.role)
  ) {
    return null;
  }

  return {
    uid: data.uid,
    name: data.name,
    email: data.email,
    role: data.role,
    createdAt,
  };
}
