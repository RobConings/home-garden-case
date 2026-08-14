# Rootly

Garden planner dashboard built with an Nx monorepo.

The project contains:

- `apps/api`: Fastify API with SQLite, Kysely, Zod schemas, Swagger docs, and service/repository layers.
- `apps/web`: Remix frontend generated through Nx.
- Storybook for frontend component development.
- PM2 configs for development and production process management.
- Frontend architecture documentation in `docs/frontend-architecture.md`.

## Prerequisites

On the Linux server:

```sh
npm install
```

PM2 is expected to be available on the server for PM2 commands:

```sh
npm install -g pm2
```

## Ports

Development PM2:

```text
API        http://localhost:3100
API docs   http://localhost:3100/docs
Web        http://localhost:3101
Storybook  http://localhost:6006
```

Production PM2:

```text
API        http://localhost:3000
API docs   http://localhost:3000/docs
Web        http://localhost:3001
```

## Run Locally With Nx

Run the API:

```sh
NX_DAEMON=false nx dev api
```

Run the web app:

```sh
NX_DAEMON=false nx dev web --host 0.0.0.0 --port 3101
```

Run Storybook:

```sh
NX_DAEMON=false nx storybook @itp-home-garden/web --host 0.0.0.0 --port 6006
```

`NX_DAEMON=false` is recommended for this server setup because PM2-managed Nx dev processes can conflict with Nx daemon/plugin workers.

## Run Development With PM2

Start API, web, and Storybook:

```sh
npm run pm2:dev:start
```

Stop them:

```sh
npm run pm2:dev:stop
```

Reload them:

```sh
npm run pm2:dev:reload
```

View logs:

```sh
npm run pm2:logs
```

Dev PM2 process names:

```text
home-garden-api-dev
home-garden-web-dev
home-garden-storybook-dev
```

Start only one dev process:

```sh
pm2 start ecosystem.dev.config.cjs --only home-garden-api-dev
pm2 start ecosystem.dev.config.cjs --only home-garden-web-dev
pm2 start ecosystem.dev.config.cjs --only home-garden-storybook-dev
```

If PM2 has stale crashed processes:

```sh
pm2 delete home-garden-api-dev home-garden-web-dev home-garden-storybook-dev
npm run pm2:dev:start
```

## Run Production With PM2

Build first:

```sh
NX_DAEMON=false nx build api
NX_DAEMON=false nx build web
```

Start the built API and web app:

```sh
npm run pm2:start
```

Reload after a new build:

```sh
npm run pm2:reload
```

Stop production processes:

```sh
npm run pm2:stop
```

Persist the PM2 process list across server restarts:

```sh
pm2 save
```

Production PM2 process names:

```text
home-garden-api
home-garden-web
```

## Available PM2 Scripts

```sh
npm run pm2:start       # start production API and web
npm run pm2:reload      # reload production API and web
npm run pm2:stop        # stop production API and web
npm run pm2:logs        # show PM2 logs
npm run pm2:dev:start   # start dev API, web, and Storybook
npm run pm2:dev:reload  # reload dev API, web, and Storybook
npm run pm2:dev:stop    # stop dev API, web, and Storybook
```

## Backend

The API is a Fastify application.

Main features:

- SQLite database stored at `db.sqlite`.
- Kysely query builder.
- Automatic migrations on API startup.
- Zod request/response schemas.
- Swagger UI at `/docs`.
- Awilix dependency injection.
- Service/repository layering.

## Frontend

The frontend is a Remix app.

Frontend stack:

- React
- Remix
- Tailwind CSS
- Radix UI primitives where needed
- local shadcn/ui-style components
- `lucide-react` icons
- Storybook
- Vitest and Testing Library

Component architecture is documented in:

```text
docs/frontend-architecture.md
```

Use this structure inside `apps/web/app`:

```text
components/
  ui/
  shared/
  layout/
providers/
features/
  gardens/
    components/
  plants/
    components/
  users/
    components/
routes/
```

Frontend path aliases:

```text
@/*              -> apps/web/app/*
@/components/*   -> apps/web/app/components/*
@/features/*     -> apps/web/app/features/*
@/hooks/*        -> apps/web/app/hooks/*
@/lib/*          -> apps/web/app/lib/*
@/providers/*    -> apps/web/app/providers/*
@/routes/*       -> apps/web/app/routes/*
@/types/*        -> apps/web/app/types/*
```

## Tests And Checks

Run checks through Nx:

```sh
NX_DAEMON=false nx lint web
NX_DAEMON=false nx test web
NX_DAEMON=false nx build web
NX_DAEMON=false nx build api
```

Run all common targets:

```sh
NX_DAEMON=false nx run-many -t lint test build typecheck
```

## Storybook

Storybook is used to build and review reusable UI components in isolation.

Stories live in `apps/web/stories`, mirroring the component architecture. Do not put
`.stories.tsx` files inside `apps/web/app/components`.

Preferred story placement:

```text
apps/web/stories/ui/input.stories.tsx
apps/web/stories/shared/general-form.stories.tsx
apps/web/stories/layout/page-container.stories.tsx
apps/web/stories/features/gardens/garden-card.stories.tsx
```

Stories should use mock data, not live backend calls.
