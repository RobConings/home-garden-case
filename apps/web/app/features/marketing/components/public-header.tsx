import { Link } from '@remix-run/react';
import { ThemeToggle } from '@/components/shared';
import { PageContainer, PageRow, PageSection } from '@/components/layout';
import { Button } from '@/components/ui/button';

export function PublicHeader() {
  return (
    <PageSection
      spacing="none"
      className="sticky top-0 z-20 border-b border-[var(--rootly-border)] bg-[var(--rootly-background)]/90 backdrop-blur"
    >
      <PageContainer className="flex h-24 items-center justify-between py-0">
        <Link to="/" aria-label="Rootly garden planner home">
          <img
            src="/rootly.png"
            alt="Rootly garden planner logo"
            width={1536}
            height={1024}
            className="h-16 w-auto max-w-[220px] rounded-md object-contain object-left sm:h-[72px]"
          />
        </Link>
        <PageRow as="nav" gap="sm" align="center">
          <ThemeToggle />
          <Button asChild variant="ghost" size="sm">
            <Link to="/login">Login</Link>
          </Button>
          <Button asChild size="sm">
            <Link to="/register">Register</Link>
          </Button>
        </PageRow>
      </PageContainer>
    </PageSection>
  );
}
