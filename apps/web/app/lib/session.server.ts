import { createCookieSessionStorage, redirect } from '@remix-run/node';
import type { UserResponse } from '@/features/users/api/users.server';
import { textLimits, toSafeDisplayText } from './plain-text';

const sessionSecret = process.env.SESSION_SECRET || 'rootly-development-session-secret';
const sessionCookieSecure = process.env.SESSION_COOKIE_SECURE === 'true';
const userSessionKey = 'user';

export type UserSession = Pick<
  UserResponse,
  'userId' | 'firstName' | 'lastName' | 'emailAddress' | 'themePreference'
>;

const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: 'rootly_session',
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
    sameSite: 'lax',
    secrets: [sessionSecret],
    secure: sessionCookieSecure,
  },
});

export async function getCurrentUser(request: Request) {
  const session = await sessionStorage.getSession(request.headers.get('Cookie'));
  const user = session.get(userSessionKey);

  return normalizeUserSession(user);
}

export async function requireUser(request: Request) {
  const user = await getCurrentUser(request);

  if (!user) {
    throw redirect('/login');
  }

  return user;
}

export async function createUserSession({
  request,
  user,
  redirectTo,
}: {
  request: Request;
  user: UserSession;
  redirectTo: string;
}) {
  const session = await sessionStorage.getSession(request.headers.get('Cookie'));
  session.set(userSessionKey, user);

  return redirect(redirectTo, {
    headers: {
      'Set-Cookie': await sessionStorage.commitSession(session),
    },
  });
}

export async function updateCurrentUserSession({
  request,
  user,
}: {
  request: Request;
  user: UserSession;
}) {
  const session = await sessionStorage.getSession(request.headers.get('Cookie'));
  session.set(userSessionKey, user);

  return await sessionStorage.commitSession(session);
}

export async function destroyUserSession(request: Request) {
  const session = await sessionStorage.getSession(request.headers.get('Cookie'));

  return redirect('/login', {
    headers: {
      'Set-Cookie': await sessionStorage.destroySession(session),
    },
  });
}

function normalizeUserSession(value: unknown): UserSession | null {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const candidate = value as Record<string, unknown>;
  if (
    typeof candidate.userId !== 'number' ||
    (typeof candidate.firstName !== 'string' && candidate.firstName !== null) ||
    (typeof candidate.lastName !== 'string' && candidate.lastName !== null) ||
    typeof candidate.emailAddress !== 'string'
  ) {
    return null;
  }

  return {
    userId: candidate.userId,
    firstName: candidate.firstName
      ? toSafeDisplayText(candidate.firstName, textLimits.personName)
      : null,
    lastName: candidate.lastName
      ? toSafeDisplayText(candidate.lastName, textLimits.personName)
      : null,
    emailAddress: toSafeDisplayText(candidate.emailAddress, textLimits.email),
    themePreference:
      candidate.themePreference === 'light' || candidate.themePreference === 'dark'
        ? candidate.themePreference
        : 'light',
  };
}
