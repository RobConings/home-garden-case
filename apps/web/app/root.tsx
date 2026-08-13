import type { LinksFunction, MetaFunction } from '@remix-run/node';
import {
  isRouteErrorResponse,
  Link,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useRouteError,
} from '@remix-run/react';
import { Button } from '@/components/ui/button';
import stylesheet from './styles/global.css?url';

const themeInitScript = `
  (() => {
    try {
      const stored = localStorage.getItem('rootly-theme');
      const mode = stored === 'light' || stored === 'dark'
        ? stored
        : (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
      document.documentElement.classList.toggle('dark', mode === 'dark');
      document.documentElement.dataset.theme = mode;
    } catch (_) {}
  })();
`;

export const meta: MetaFunction = () => [
  {
    title: 'Rootly',
  },
  {
    name: 'description',
    content: 'Rootly is a garden planner dashboard for managing gardens, plants, and growing space.',
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

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
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
