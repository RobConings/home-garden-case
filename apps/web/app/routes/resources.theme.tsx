import type { ActionFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { updateUserTheme } from '@/features/users/api/users.server';
import { requireUser, updateCurrentUserSession } from '@/lib/session.server';

export async function action({ request }: ActionFunctionArgs) {
  const user = await requireUser(request);
  const formData = await request.formData();
  const themePreference = String(formData.get('themePreference') || '');

  if (themePreference !== 'light' && themePreference !== 'dark') {
    return json({ error: 'Invalid theme preference' }, { status: 400 });
  }

  const updatedUser = await updateUserTheme(user.userId, { themePreference });
  const cookie = await updateCurrentUserSession({
    request,
    user: updatedUser,
  });

  return json(
    { user: updatedUser },
    {
      headers: {
        'Set-Cookie': cookie,
      },
    },
  );
}
