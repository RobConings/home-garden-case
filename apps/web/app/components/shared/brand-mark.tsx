import { cn } from '@/lib/utils';

export type BrandMarkProps = {
  className?: string;
  imageClassName?: string;
  compact?: boolean;
};

export function BrandMark({ className, imageClassName, compact = false }: BrandMarkProps) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <img
        src="/rootly.png"
        alt="Rootly"
        className={cn(
          compact ? 'h-10 w-10 rounded-md object-cover object-left' : 'h-12 w-auto object-contain',
          imageClassName,
        )}
      />
      {compact ? (
        <span className="text-base font-semibold text-[var(--rootly-text)]">Rootly</span>
      ) : null}
    </div>
  );
}
