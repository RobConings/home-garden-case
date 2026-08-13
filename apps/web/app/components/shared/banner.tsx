import type { ReactNode } from 'react';
import { PageContainer, PageSection, PageStack } from '@/components/layout';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export type BannerProps = {
  badge?: string;
  title: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
  imageWidth: number;
  imageHeight: number;
  actions?: ReactNode;
  className?: string;
};

export function Banner({
  badge,
  title,
  description,
  imageSrc,
  imageAlt,
  imageWidth,
  imageHeight,
  actions,
  className,
}: BannerProps) {
  return (
    <PageSection slot="top" spacing="none" className={cn('relative overflow-hidden', className)}>
      <PageStack className="absolute inset-0" gap="none">
        <img
          src={imageSrc}
          alt={imageAlt}
          width={imageWidth}
          height={imageHeight}
          loading="eager"
          decoding="async"
          className="h-full w-full object-cover object-center opacity-90"
        />
        <PageStack
          className="absolute inset-0 bg-[linear-gradient(90deg,rgba(16,22,17,0.94),rgba(16,22,17,0.72),rgba(16,22,17,0.26))]"
          gap="none"
          aria-hidden="true"
        />
      </PageStack>
      <PageContainer className="relative grid min-h-[68svh] items-center py-16">
        <PageStack className="max-w-2xl" gap="md">
          {badge ? <Badge variant="success">{badge}</Badge> : null}
          <div>
            <h1 className="text-5xl font-semibold text-white sm:text-6xl">{title}</h1>
            <p className="mt-4 text-lg leading-8 text-white/80">{description}</p>
          </div>
          {actions}
        </PageStack>
      </PageContainer>
    </PageSection>
  );
}
