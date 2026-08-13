import type { LucideIcon } from 'lucide-react';
import { BellRing } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { PageRow } from '@/components/layout/page-row';

export type NotificationCalloutProps = {
  title: string;
  description: string;
  icon?: LucideIcon;
};

export function NotificationCallout({
  title,
  description,
  icon: Icon = BellRing,
}: NotificationCalloutProps) {
  return (
    <Card>
      <CardContent className="p-5">
        <PageRow align="between" gap="md">
          <div>
            <h3 className="text-base font-semibold text-[var(--rootly-text)]">{title}</h3>
            <p className="mt-1 text-sm leading-6 text-[var(--rootly-text-muted)]">{description}</p>
          </div>
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-[var(--rootly-accent-soft)] text-[var(--rootly-accent)]">
            <Icon aria-hidden="true" className="h-5 w-5" />
          </div>
        </PageRow>
      </CardContent>
    </Card>
  );
}
