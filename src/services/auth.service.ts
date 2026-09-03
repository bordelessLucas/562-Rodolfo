import {
  User,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';

import { auth } from '@/src/services/firebase';

export type AuthCredentials = {
  email: string;
  password: string;
};

export async function signIn({
  email,
  password,
}: AuthCredentials): Promise<User> {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return credential.user;
}

export async function signUp({
  email,
  password,
}: AuthCredentials): Promise<User> {
  const credential = await createUserWithEmailAndPassword(
    auth,
    email,
    password,
  );
  return credential.user;
}

export async function logOut(): Promise<void> {
  await signOut(auth);
}

export async function resetPassword(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email);
}

export function mapAuthError(error: unknown): string {
  if (typeof error !== 'object' || error === null || !('code' in error)) {
    return 'Ocorreu um erro inesperado. Tente novamente.';
  }

  const code = String((error as { code: string }).code);

  switch (code) {
    case 'auth/invalid-email':
      return 'E-mail inválido.';
    case 'auth/user-disabled':
      return 'Esta conta foi desativada.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'E-mail ou senha incorretos.';
    case 'auth/email-already-in-use':
      return 'Este e-mail já está em uso.';
    case 'auth/weak-password':
      return 'A senha deve ter pelo menos 6 caracteres.';
    case 'auth/too-many-requests':
      return 'Muitas tentativas. Aguarde e tente novamente.';
    case 'auth/network-request-failed':
      return 'Falha de rede. Verifique sua conexão.';
    default:
      return 'Não foi possível concluir a autenticação.';
  }
}
