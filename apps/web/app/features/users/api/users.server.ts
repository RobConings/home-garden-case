import { apiRequest } from '@/lib/api.server';
import { textLimits, toSafeDisplayText } from '@/lib/plain-text';

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
  const user = await apiRequest<UserResponse>('/users', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return normalizeUser(user);
}

export async function loginUser(payload: LoginUserPayload) {
  const user = await apiRequest<UserResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return normalizeUser(user);
}

export async function resetPassword(payload: ResetPasswordPayload) {
  const user = await apiRequest<UserResponse>('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return normalizeUser(user);
}

export async function updateUserTheme(
  userId: number,
  payload: { themePreference: 'light' | 'dark' },
) {
  const user = await apiRequest<UserResponse>(`/users/${userId}/theme`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
  return normalizeUser(user);
}

function normalizeUser(user: UserResponse): UserResponse {
  return {
    ...user,
    firstName: user.firstName ? toSafeDisplayText(user.firstName, textLimits.personName) : null,
    lastName: user.lastName ? toSafeDisplayText(user.lastName, textLimits.personName) : null,
    emailAddress: toSafeDisplayText(user.emailAddress, textLimits.email),
  };
}
