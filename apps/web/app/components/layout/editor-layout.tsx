import type { ReactNode } from 'react';
import { PageGrid } from './page-grid';
import { PageStack } from './page-stack';

type EditorLayoutProps = {
  controls: ReactNode;
  board: ReactNode;
};

export function EditorLayout({ controls, board }: EditorLayoutProps) {
  return (
    <PageStack gap="md">
      <PageGrid columns={3} gap="sm" align="start">
        {controls}
      </PageGrid>
      <section className="min-w-0">{board}</section>
    </PageStack>
  );
}
