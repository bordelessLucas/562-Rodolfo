import {
  ReactNode,
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';

import type { UserProfile, UserRole } from '@/src/domain/user';
import {
  logOut as authLogOut,
  mapAuthError,
  resetPassword as authResetPassword,
  signIn as authSignIn,
  signUp as authSignUp,
} from '@/src/services/auth.service';
import { auth } from '@/src/services/firebase';
import {
  createUserProfile,
  getUserProfile,
} from '@/src/services/user.service';

export type RegisterInput = {
  name: string;
  email: string;
  password: string;
  role: UserRole;
};

export type AuthContextValue = {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (input: RegisterInput) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (nextUser) => {
      setUser(nextUser);

      if (!nextUser) {
        setProfile(null);
        setLoading(false);
        return;
      }

      try {
        const nextProfile = await getUserProfile(nextUser.uid);
        setProfile(nextProfile);
      } catch {
        setProfile(null);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      await authSignIn({ email: email.trim(), password });
    } catch (error) {
      throw new Error(mapAuthError(error));
    }
  }, []);

  const signUp = useCallback(async (input: RegisterInput) => {
    try {
      const createdUser = await authSignUp({
        email: input.email.trim(),
        password: input.password,
      });

      await createUserProfile({
        uid: createdUser.uid,
        name: input.name,
        email: input.email,
        role: input.role,
      });

      const nextProfile = await getUserProfile(createdUser.uid);
      setProfile(nextProfile);
    } catch (error) {
      throw new Error(mapAuthError(error));
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      await authLogOut();
      setProfile(null);
    } catch (error) {
      throw new Error(mapAuthError(error));
    }
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    try {
      await authResetPassword(email.trim());
    } catch (error) {
      throw new Error(mapAuthError(error));
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      profile,
      loading,
      signIn,
      signUp,
      signOut,
      resetPassword,
    }),
    [user, profile, loading, signIn, signUp, signOut, resetPassword],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
