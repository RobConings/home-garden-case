import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

export type AppShellProps = HTMLAttributes<HTMLDivElement> & {
  header?: ReactNode;
  sidebar?: ReactNode;
};

export function AppShell({ className, header, sidebar, children, ...props }: AppShellProps) {
  return (
    <div
      className={cn(
        'min-h-screen bg-[var(--rootly-background)] text-[var(--rootly-text)]',
        className,
      )}
      {...props}
    >
      {header ? (
        <header className="sticky top-0 z-10 border-b border-[var(--rootly-border)] bg-[var(--rootly-surface)]/95 backdrop-blur">
          {header}
        </header>
      ) : null}
      <div className="flex min-h-[calc(100vh-64px)]">
        {sidebar ? (
          <aside className="hidden shrink-0 border-r border-[var(--rootly-border)] bg-[var(--rootly-surface)] lg:block">
            {sidebar}
          </aside>
        ) : null}
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
