import type { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export type FeatureCardProps = {
  title: string;
  description: string;
  icon: LucideIcon;
};

export function FeatureCard({ title, description, icon: Icon }: FeatureCardProps) {
  return (
    <Card className="h-full transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <CardContent className="p-5">
        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-md bg-[var(--rootly-primary-soft)] text-[var(--rootly-primary)]">
          <Icon aria-hidden="true" className="h-5 w-5" />
        </div>
        <h3 className="text-base font-semibold text-[var(--rootly-text)]">{title}</h3>
        <p className="mt-2 text-sm leading-6 text-[var(--rootly-text-muted)]">{description}</p>
      </CardContent>
    </Card>
  );
}
