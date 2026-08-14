import type { LinksFunction, LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import { useEffect, useState } from 'react';
import {
  isRouteErrorResponse,
  Link,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLocation,
  useNavigation,
  useRouteLoaderData,
  useRouteError,
} from '@remix-run/react';
import { AppProviders } from '@/providers';
import { Button } from '@/components/ui/button';
import { getCurrentUser } from '@/lib/session.server';
import { getThemeClass, type RootlyThemeMode } from '@/lib/theme';
import stylesheet from './styles/global.css?url';

function isThemeMode(value: unknown): value is RootlyThemeMode {
  return value === 'light' || value === 'dark';
}

function createThemeInitScript(themePreference?: RootlyThemeMode | null) {
  return `
  (() => {
    try {
      const accountMode = ${JSON.stringify(themePreference ?? null)};
      const stored = localStorage.getItem('rootly-theme');
      const mode = accountMode === 'light' || accountMode === 'dark'
        ? accountMode
        : stored === 'light' || stored === 'dark'
        ? stored
        : (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
      document.documentElement.classList.toggle('dark', mode === 'dark');
      document.documentElement.dataset.theme = mode;
    } catch (_) {}
  })();
`;
}

export const meta: MetaFunction = () => [
  {
    title: 'Rootly',
  },
  {
    name: 'description',
    content:
      'Rootly is a garden planner dashboard for managing gardens, plants, and growing space.',
  },
  {
    name: 'theme-color',
    content: '#2F8F46',
  },
];

export const links: LinksFunction = () => [
  { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
  {
    rel: 'preconnect',
    href: 'https://fonts.gstatic.com',
    crossOrigin: 'anonymous',
  },
  {
    rel: 'stylesheet',
    href: 'https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap',
  },
  { rel: 'icon', href: '/favicon.ico' },
  { rel: 'stylesheet', href: stylesheet },
];

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await getCurrentUser(request);

  return { user };
}

export function Layout({ children }: { children: React.ReactNode }) {
  const rootData = useRouteLoaderData<typeof loader>('root');
  const user = rootData?.user ?? null;
  const themePreference = isThemeMode(user?.themePreference) ? user.themePreference : null;
  const themeInitScript = createThemeInitScript(themePreference);

  return (
    <html
      lang="en"
      className={themePreference ? getThemeClass(themePreference) : undefined}
      data-theme={themePreference ?? undefined}
      suppressHydrationWarning
    >
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <Meta />
        <Links />
      </head>
      <body>
        <AppProviders user={user}>{children}</AppProviders>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return (
    <>
      <RouteChangeLoader />
      <Outlet />
    </>
  );
}

function RouteChangeLoader() {
  const navigation = useNavigation();
  const location = useLocation();
  const [isOptimisticPending, setIsOptimisticPending] = useState(false);
  const isNavigating = navigation.state !== 'idle' || isOptimisticPending;

  useEffect(() => {
    setIsOptimisticPending(false);
  }, [location.key]);

  useEffect(() => {
    if (navigation.state === 'idle') {
      setIsOptimisticPending(false);
    }
  }, [navigation.state]);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      if (!(event.target instanceof Element)) {
        return;
      }

      const link = event.target.closest('a[href]');

      if (!link || shouldIgnoreNavigationUrl(link.getAttribute('href'))) {
        return;
      }

      setIsOptimisticPending(true);
    }

    function handleSubmit(event: SubmitEvent) {
      if (!event.defaultPrevented) {
        setIsOptimisticPending(true);
      }
    }

    document.addEventListener('click', handleClick, true);
    document.addEventListener('submit', handleSubmit, true);

    return () => {
      document.removeEventListener('click', handleClick, true);
      document.removeEventListener('submit', handleSubmit, true);
    };
  }, []);

  if (!isNavigating) {
    return null;
  }

  return (
    <div className="fixed inset-x-0 top-0 z-50 pointer-events-none">
      <div className="h-1 overflow-hidden bg-[var(--rootly-primary-soft)]">
        <div className="h-full w-1/2 animate-[rootly-progress_1.1s_ease-in-out_infinite] rounded-r-full bg-[var(--rootly-primary)]" />
      </div>
      <div className="mx-auto mt-3 flex w-fit items-center gap-3 rounded-md border border-[var(--rootly-border)] bg-[var(--rootly-surface)]/95 px-4 py-2 text-sm font-medium text-[var(--rootly-text)] shadow-[var(--rootly-shadow)] backdrop-blur">
        <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-[var(--rootly-primary)]" />
        Loading page
      </div>
    </div>
  );
}

function shouldIgnoreNavigationUrl(href: string | null) {
  if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) {
    return true;
  }

  try {
    const url = new URL(href, window.location.href);

    return url.origin !== window.location.origin || url.href === window.location.href;
  } catch {
    return true;
  }
}

export function ErrorBoundary() {
  const error = useRouteError();
  const isNotFound = isRouteErrorResponse(error) && error.status === 404;
  const title = isNotFound ? 'This path has not sprouted yet.' : 'Something needs repotting.';
  const description = isNotFound
    ? 'We checked the beds, the pots, and the compost pile. This page is still missing from the garden.'
    : 'The page hit an unexpected snag. Head back home and try a fresh route.';

  return (
    <main className="min-h-screen bg-[var(--rootly-background)] text-[var(--rootly-text)]">
      <div className="mx-auto grid min-h-screen w-full max-w-6xl items-center gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
        <section className="flex flex-col gap-5">
          <p className="text-sm font-semibold uppercase tracking-wide text-[var(--rootly-accent)]">
            {isNotFound ? '404 not found' : 'Error'}
          </p>
          <div className="flex flex-col gap-3">
            <h1 className="max-w-2xl text-4xl font-semibold text-[var(--rootly-text)] sm:text-5xl">
              {title}
            </h1>
            <p className="max-w-xl text-base leading-7 text-[var(--rootly-text-muted)]">
              {description}
            </p>
          </div>
          <div>
            <Button asChild size="lg">
              <Link to="/">Back to the garden gate</Link>
            </Button>
          </div>
        </section>
        <img
          src="/404_not_found.png"
          alt="A small confused plant beside a wooden 404 sign in a garden"
          width={1448}
          height={1086}
          loading="eager"
          decoding="async"
          className="w-full rounded-md border border-[var(--rootly-border)] object-cover shadow-[var(--rootly-shadow)]"
        />
      </div>
    </main>
  );
}
