import {
  ReactNode,
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';

import type { SignUpRole, UserProfile } from '@/src/domain/user';
import {
  deleteAuthUser,
  logOut as authLogOut,
  mapAuthError,
  normalizeEmail,
  resetPassword as authResetPassword,
  signIn as authSignIn,
  signUp as authSignUp,
} from '@/src/services/auth.service';
import { auth } from '@/src/services/firebase';
import {
  createUserProfileWithRetry,
  getUserProfile,
  updateUserProfile as updateUserProfileService,
} from '@/src/services/user.service';

export type RegisterInput = {
  name: string;
  email: string;
  password: string;
  role: SignUpRole;
};

export type AuthContextValue = {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  profileLoading: boolean;
  profileError: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (input: RegisterInput) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateProfile: (name: string) => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  const loadProfile = useCallback(async (uid: string) => {
    setProfileLoading(true);
    setProfileError(null);

    try {
      const nextProfile = await getUserProfile(uid);
      setProfile(nextProfile);

      if (!nextProfile) {
        setProfileError(
          'Não encontramos seu perfil. Toque em tentar novamente.',
        );
      }
    } catch (error) {
      setProfile(null);
      setProfileError(mapAuthError(error));
    } finally {
      setProfileLoading(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (nextUser) => {
      setUser(nextUser);

      if (!nextUser) {
        setProfile(null);
        setProfileError(null);
        setProfileLoading(false);
        setLoading(false);
        return;
      }

      await loadProfile(nextUser.uid);
      setLoading(false);
    });

    return unsubscribe;
  }, [loadProfile]);

  const refreshProfile = useCallback(async () => {
    const current = auth.currentUser;
    if (!current) {
      setProfile(null);
      return;
    }

    await loadProfile(current.uid);
  }, [loadProfile]);

  const updateProfile = useCallback(
    async (name: string) => {
      const current = auth.currentUser;
      if (!current) {
        throw new Error('Sessão expirada. Entre novamente.');
      }

      try {
        await updateUserProfileService(current.uid, { name });
        await loadProfile(current.uid);
      } catch (error) {
        throw new Error(mapAuthError(error));
      }
    },
    [loadProfile],
  );

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      await authSignIn({ email: normalizeEmail(email), password });
    } catch (error) {
      throw new Error(mapAuthError(error));
    }
  }, []);

  const signUp = useCallback(async (input: RegisterInput) => {
    const email = normalizeEmail(input.email);
    let createdUser: User | null = null;

    try {
      createdUser = await authSignUp({
        email,
        password: input.password,
      });

      await createUserProfileWithRetry({
        uid: createdUser.uid,
        name: input.name.trim(),
        email,
        role: input.role,
      });

      const nextProfile = await getUserProfile(createdUser.uid);
      setProfile(nextProfile);
      setProfileError(
        nextProfile
          ? null
          : 'Conta criada, mas o perfil ainda não carregou. Tente atualizar.',
      );
    } catch (error) {
      if (createdUser) {
        try {
          await deleteAuthUser(createdUser);
        } catch {
          // Conta Auth pode permanecer; usuário verá o erro abaixo.
        }
      }

      throw new Error(
        mapAuthError(error) === 'Não foi possível concluir a autenticação.'
          ? 'Não foi possível salvar seu perfil. Tente criar a conta novamente.'
          : mapAuthError(error),
      );
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      await authLogOut();
      setProfile(null);
      setProfileError(null);
    } catch (error) {
      throw new Error(mapAuthError(error));
    }
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    try {
      await authResetPassword(normalizeEmail(email));
    } catch (error) {
      throw new Error(mapAuthError(error));
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      profile,
      loading,
      profileLoading,
      profileError,
      signIn,
      signUp,
      signOut,
      resetPassword,
      refreshProfile,
      updateProfile,
    }),
    [
      user,
      profile,
      loading,
      profileLoading,
      profileError,
      signIn,
      signUp,
      signOut,
      resetPassword,
      refreshProfile,
      updateProfile,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
