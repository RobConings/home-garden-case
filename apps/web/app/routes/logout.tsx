import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { destroyUserSession } from '@/lib/session.server';

export async function action({ request }: ActionFunctionArgs) {
  return await destroyUserSession(request);
}

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);

  if (url.searchParams.get('logout') === 'true') {
    return await destroyUserSession(request);
  }

  return redirect('/dashboard');
}
