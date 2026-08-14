import { useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Grid2X2, List, Search } from 'lucide-react';
import { PageGrid, PageRow } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

type GeneralListColumn<TItem> = {
  key: string;
  label: string;
  render: (item: TItem) => ReactNode;
  className?: string;
};

export type GeneralListProps<TItem> = {
  items: TItem[];
  getKey: (item: TItem) => string | number;
  getSearchText: (item: TItem) => string;
  renderCard: (item: TItem) => ReactNode;
  columns: GeneralListColumn<TItem>[];
  emptyState?: ReactNode;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (query: string) => void;
  hasMore?: boolean;
  isLoading?: boolean;
  onLoadMore?: () => void;
  className?: string;
};

export function GeneralList<TItem>({
  items,
  getKey,
  getSearchText,
  renderCard,
  columns,
  emptyState,
  searchPlaceholder = 'Search',
  searchValue,
  onSearchChange,
  hasMore = false,
  isLoading = false,
  onLoadMore,
  className,
}: GeneralListProps<TItem>) {
  const [localQuery, setLocalQuery] = useState('');
  const [view, setView] = useState<'cards' | 'list'>('cards');
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const query = searchValue ?? localQuery;
  const normalizedQuery = query.trim().toLowerCase();
  const usesServerSearch = Boolean(onSearchChange);
  const filteredItems = useMemo(() => {
    if (usesServerSearch) {
      return items;
    }

    if (!normalizedQuery) {
      return items;
    }

    return items.filter((item) => getSearchText(item).toLowerCase().includes(normalizedQuery));
  }, [getSearchText, items, normalizedQuery, usesServerSearch]);

  useEffect(() => {
    if (!hasMore || isLoading || !onLoadMore) {
      return;
    }

    const marker = loadMoreRef.current;
    if (!marker) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          onLoadMore();
        }
      },
      { rootMargin: '240px' },
    );

    observer.observe(marker);

    return () => observer.disconnect();
  }, [hasMore, isLoading, onLoadMore]);

  function handleSearchChange(nextQuery: string) {
    if (onSearchChange) {
      onSearchChange(nextQuery);
      return;
    }

    setLocalQuery(nextQuery);
  }

  return (
    <div className={cn('grid gap-4', className)}>
      <PageRow align="between" gap="sm">
        <div className="relative min-w-0 flex-1">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--rootly-text-muted)]"
          />
          <Input
            value={query}
            onChange={(event) => handleSearchChange(event.target.value)}
            placeholder={searchPlaceholder}
            className="pl-9"
          />
        </div>
        <div className="flex shrink-0 items-center rounded-md border border-[var(--rootly-border)] bg-[var(--rootly-surface)] p-1">
          <Button
            type="button"
            size="icon"
            variant={view === 'cards' ? 'subtle' : 'ghost'}
            aria-label="Show cards"
            onClick={() => setView('cards')}
          >
            <Grid2X2 aria-hidden="true" className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            size="icon"
            variant={view === 'list' ? 'subtle' : 'ghost'}
            aria-label="Show list"
            onClick={() => setView('list')}
          >
            <List aria-hidden="true" className="h-4 w-4" />
          </Button>
        </div>
      </PageRow>

      {filteredItems.length === 0 && !isLoading ? (
        (emptyState ?? null)
      ) : (
        <>
          {view === 'cards' ? (
            <PageGrid columns={3} gap="sm">
              {filteredItems.map((item) => (
                <div key={getKey(item)}>{renderCard(item)}</div>
              ))}
            </PageGrid>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  {columns.map((column) => (
                    <TableHead key={column.key} className={column.className}>
                      {column.label}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((item) => (
                  <TableRow key={getKey(item)}>
                    {columns.map((column) => (
                      <TableCell key={column.key} className={column.className}>
                        {column.render(item)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {onLoadMore ? <div ref={loadMoreRef} aria-hidden="true" className="h-1" /> : null}

          {isLoading ? (
            view === 'cards' ? (
              <PageGrid columns={3} gap="sm">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-40 animate-pulse rounded-md border border-[var(--rootly-border)] bg-[var(--rootly-surface)]"
                  />
                ))}
              </PageGrid>
            ) : (
              <Table>
                <TableBody>
                  {Array.from({ length: 3 }).map((_, rowIndex) => (
                    <TableRow key={rowIndex}>
                      {columns.map((column) => (
                        <TableCell key={column.key} className={column.className}>
                          <div className="h-4 animate-pulse rounded bg-[var(--rootly-border)]" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )
          ) : null}
        </>
      )}
    </div>
  );
}
