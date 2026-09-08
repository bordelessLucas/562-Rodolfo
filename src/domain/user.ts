export type UserRole = 'paciente' | 'profissional' | 'admin';

/** Roles permitidos no self-signup (admin só manual). */
export type SignUpRole = 'paciente' | 'profissional';

export type UserProfile = {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date | null;
};

export type CreateUserProfileInput = {
  uid: string;
  name: string;
  email: string;
  role: SignUpRole;
};

export type UpdateUserProfileInput = {
  name: string;
};

export function isSignUpRole(value: unknown): value is SignUpRole {
  return value === 'paciente' || value === 'profissional';
}

export function isUserRole(value: unknown): value is UserRole {
  return (
    value === 'paciente' || value === 'profissional' || value === 'admin'
  );
}
