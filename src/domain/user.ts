export type UserRole = 'paciente' | 'profissional';

export type UserProfile = {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: Date;
};

export type CreateUserProfileInput = {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
};
