export type UserRole = 'paciente' | 'profissional';

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
  role: UserRole;
};

export type UpdateUserProfileInput = {
  name: string;
};
