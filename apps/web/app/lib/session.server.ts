import { createCookieSessionStorage, redirect } from '@remix-run/node';
import type { UserResponse } from '@/features/users/api/users.server';

const sessionSecret = process.env.SESSION_SECRET || 'rootly-development-session-secret';
const sessionCookieSecure = process.env.SESSION_COOKIE_SECURE === 'true';
const userSessionKey = 'user';

export type UserSession = Pick<
  UserResponse,
  'userId' | 'firstName' | 'lastName' | 'emailAddress'
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

  return isUserSession(user) ? user : null;
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

export async function destroyUserSession(request: Request) {
  const session = await sessionStorage.getSession(request.headers.get('Cookie'));

  return redirect('/login', {
    headers: {
      'Set-Cookie': await sessionStorage.destroySession(session),
    },
  });
}

function isUserSession(value: unknown): value is UserSession {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.userId === 'number' &&
    typeof candidate.firstName === 'string' &&
    typeof candidate.lastName === 'string' &&
    typeof candidate.emailAddress === 'string'
  );
}
