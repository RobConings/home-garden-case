import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

export type AppShellProps = HTMLAttributes<HTMLDivElement> & {
  header?: ReactNode;
  sidebar?: ReactNode;
};

export function AppShell({ className, header, sidebar, children, ...props }: AppShellProps) {
  return (
    <div className={cn('min-h-screen bg-slate-50 text-slate-950', className)} {...props}>
      {header ? (
        <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 backdrop-blur">
          {header}
        </header>
      ) : null}
      <div className="flex min-h-[calc(100vh-64px)]">
        {sidebar ? (
          <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white lg:block">
            {sidebar}
          </aside>
        ) : null}
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
