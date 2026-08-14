import { apiRequest } from '@/lib/api.server';

export type RegisterUserPayload = {
  firstName: string;
  lastName: string;
  emailAddress: string;
  password: string;
};

export type LoginUserPayload = {
  emailAddress: string;
  password: string;
};

export type ResetPasswordPayload = {
  emailAddress: string;
  password: string;
};

export type UserResponse = {
  userId: number;
  firstName: string | null;
  lastName: string | null;
  emailAddress: string;
  themePreference: 'light' | 'dark';
  createdAt: string;
  updatedAt: string;
};

export async function registerUser(payload: RegisterUserPayload) {
  return await apiRequest<UserResponse>('/users', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function loginUser(payload: LoginUserPayload) {
  return await apiRequest<UserResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function resetPassword(payload: ResetPasswordPayload) {
  return await apiRequest<UserResponse>('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateUserTheme(
  userId: number,
  payload: { themePreference: 'light' | 'dark' },
) {
  return await apiRequest<UserResponse>(`/users/${userId}/theme`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}
