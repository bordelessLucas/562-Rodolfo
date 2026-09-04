import {
  Timestamp,
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';

import type {
  CreateUserProfileInput,
  UpdateUserProfileInput,
  UserProfile,
  UserRole,
} from '@/src/domain/user';
import { db } from '@/src/services/firebase';

function isUserRole(value: unknown): value is UserRole {
  return value === 'paciente' || value === 'profissional';
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function mapProfile(data: Record<string, unknown>): UserProfile | null {
  const createdAtRaw = data.createdAt;
  const updatedAtRaw = data.updatedAt;

  const createdAt =
    createdAtRaw instanceof Timestamp ? createdAtRaw.toDate() : new Date();
  const updatedAt =
    updatedAtRaw instanceof Timestamp ? updatedAtRaw.toDate() : null;

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
    updatedAt,
  };
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
    updatedAt: serverTimestamp(),
  });
}

export async function createUserProfileWithRetry(
  input: CreateUserProfileInput,
  retries = 1,
): Promise<void> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      await createUserProfile(input);
      return;
    } catch (error) {
      lastError = error;
      if (attempt < retries) {
        await delay(400);
      }
    }
  }

  throw lastError;
}

export async function getUserProfile(
  uid: string,
): Promise<UserProfile | null> {
  const snapshot = await getDoc(doc(db, 'users', uid));

  if (!snapshot.exists()) {
    return null;
  }

  return mapProfile(snapshot.data() as Record<string, unknown>);
}

export async function updateUserProfile(
  uid: string,
  input: UpdateUserProfileInput,
): Promise<void> {
  const name = input.name.trim();
  if (!name) {
    throw new Error('Informe um nome válido.');
  }

  await updateDoc(doc(db, 'users', uid), {
    name,
    updatedAt: serverTimestamp(),
  });
}
