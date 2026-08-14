import { useMemo, useState } from 'react';
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
  className,
}: GeneralListProps<TItem>) {
  const [query, setQuery] = useState('');
  const [view, setView] = useState<'cards' | 'list'>('cards');
  const normalizedQuery = query.trim().toLowerCase();
  const filteredItems = useMemo(() => {
    if (!normalizedQuery) {
      return items;
    }

    return items.filter((item) => getSearchText(item).toLowerCase().includes(normalizedQuery));
  }, [getSearchText, items, normalizedQuery]);

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
            onChange={(event) => setQuery(event.target.value)}
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

      {filteredItems.length === 0 ? (
        emptyState ?? null
      ) : view === 'cards' ? (
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
    </div>
  );
}
