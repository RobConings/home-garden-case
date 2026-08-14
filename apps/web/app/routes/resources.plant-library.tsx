import type { LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { getPlantLibraryPage } from '@/features/plants/api';
import { sanitizePlainText, textLimits } from '@/lib/plain-text';
import { requireUser } from '@/lib/session.server';

const defaultPlantPageSize = 12;

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireUser(request);
  const url = new URL(request.url);
  const search = sanitizePlainText(url.searchParams.get('search')).slice(0, textLimits.search);
  const limit = Number(url.searchParams.get('limit') ?? defaultPlantPageSize);
  const offset = Number(url.searchParams.get('offset') ?? 0);
  const page = await getPlantLibraryPage(user.userId, {
    search,
    limit: Number.isFinite(limit) ? limit : defaultPlantPageSize,
    offset: Number.isFinite(offset) ? offset : 0,
  });

  return json({
    ...page,
    search,
  });
}
