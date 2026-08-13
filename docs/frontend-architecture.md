# Frontend Architecture

The Remix frontend uses a component structure that combines atomic design with feature-based ownership.

## Brand And Theme

The app name is Rootly.

Rootly supports light and dark mode through CSS variables in `apps/web/app/styles/global.css`.
Use those variables for reusable components instead of hardcoded palette classes.

Core theme values:

```text
Light: background #FAF8F3, surface #FFFFFF, text #182019, primary #2F8F46, secondary #8A5A3B, accent #E97828
Dark:  background #101611, surface #182019, text #F6F7F3, primary #78C850, secondary #B9825A, accent #F49A55
```

Reusable brand/theme components:

- `components/shared/brand-mark.tsx`
- `components/shared/theme-toggle.tsx`

## Folder Structure

Use this structure inside `apps/web/app`:

```text
components/
  ui/
  shared/
  layout/
features/
  gardens/
    components/
  plants/
    components/
  users/
    components/
routes/
```

## Component Layers

### `components/ui`

Use `components/ui` for low-level reusable primitives. These are the atoms of the design system.

Examples:

- `input.tsx`
- `button.tsx`
- `label.tsx`
- `textarea.tsx`
- `select.tsx`
- `checkbox.tsx`

These components should be generic, unopinionated about business concepts, and reusable across the whole app.

Initial UI components:

- `button.tsx`
- `input.tsx`
- `label.tsx`
- `textarea.tsx`
- `select.tsx`
- `badge.tsx`
- `progress.tsx`
- `card.tsx`
- `skeleton.tsx`
- `table.tsx`

### `components/shared`

Use `components/shared` for reusable composed components. These map to molecules and organisms that are shared across multiple features.

Examples:

- `general-form.tsx`
- `empty-state.tsx`
- `data-toolbar.tsx`
- `confirm-dialog.tsx`
- `field-group.tsx`

Shared components may compose `components/ui` and `components/layout`, but they should not contain feature-specific business logic.

Initial shared components:

- `field.tsx`
- `general-form.tsx`
- `empty-state.tsx`
- `stat-card.tsx`
- `brand-mark.tsx`
- `theme-toggle.tsx`

### `components/layout`

Use `components/layout` for structural page components and reusable layout primitives.

Keep layout components directly in `components/layout`. Do not create a nested
`components/layout/structure` folder in this project.

Examples:

- `page-container.tsx`
- `page-section.tsx`
- `page-grid.tsx`
- `sidebar-layout.tsx`
- `details-layout.tsx`

Layout components should control spacing, width, grid behavior, and page structure. They should not know about gardens, plants, users, or API data.

Initial layout components:

- `app-shell.tsx`
- `content-section.tsx`
- `page-container.tsx`
- `page-divider.tsx`
- `page-section.tsx`
- `page-grid.tsx`
- `page-row.tsx`
- `page-stack.tsx`

### `features/<feature>/components`

Use feature component folders for components that belong to one domain area and are not meant to be reused globally.

Examples:

```text
features/gardens/components/garden-card.tsx
features/gardens/components/garden-form.tsx
features/plants/components/plant-list.tsx
features/plants/components/plant-type-badge.tsx
features/users/components/user-profile-summary.tsx
```

Feature components may compose `components/ui`, `components/shared`, and `components/layout`.

If a feature component becomes useful in multiple features, move it to `components/shared` and remove feature-specific assumptions from it.

## Import Direction

Keep dependencies flowing from specific to generic:

```text
routes -> features -> components/shared -> components/ui
routes -> features -> components/layout
```

Avoid imports in the opposite direction. In particular:

- `components/ui` should not import from `features`.
- `components/shared` should not import from `features`.
- `components/layout` should not import from `features`.
- Shared components should not know route paths unless they are explicitly navigation components.

## Path Aliases

Use the `@/` aliases for frontend imports from `apps/web/app`.

Configured aliases:

```text
@/*              -> apps/web/app/*
@/components/*   -> apps/web/app/components/*
@/features/*     -> apps/web/app/features/*
@/hooks/*        -> apps/web/app/hooks/*
@/lib/*          -> apps/web/app/lib/*
@/routes/*       -> apps/web/app/routes/*
@/types/*        -> apps/web/app/types/*
```

Examples:

```tsx
import { Button } from '@/components/ui/button';
import { PageContainer } from '@/components/layout/page-container';
import { GardenCard } from '@/features/gardens/components/garden-card';
```

## Storybook

Write stories for reusable components in the dedicated `apps/web/stories` tree.
Do not put `.stories.tsx` files inside `apps/web/app/components`.

Preferred story placement:

```text
stories/ui/input.stories.tsx
stories/shared/general-form.stories.tsx
stories/layout/page-container.stories.tsx
stories/features/gardens/garden-card.stories.tsx
```

The stories directory mirrors the component architecture by folder and filename.
For example, `components/ui/input.tsx` is documented by `stories/ui/input.stories.tsx`.

Storybook should cover:

- default state
- disabled/loading/empty states where applicable
- validation/error states for form components
- responsive layout examples for layout components
- realistic feature examples using mock data

Do not make Storybook stories depend on the live backend. Use static mock data or local story fixtures.

## Naming

Use kebab-case filenames:

```text
page-container.tsx
general-form.tsx
garden-card.tsx
```

Use PascalCase component exports:

```tsx
export function PageContainer() {}
export function GeneralForm() {}
export function GardenCard() {}
```

## Placement Rules

Before creating a component, choose the narrowest correct home:

1. Is it a low-level primitive? Put it in `components/ui`.
2. Is it structural layout only? Put it in `components/layout`.
3. Is it reusable across multiple features? Put it in `components/shared`.
4. Is it only used by one feature? Put it in `features/<feature>/components`.

Do not place new components directly in a generic `components` root.
