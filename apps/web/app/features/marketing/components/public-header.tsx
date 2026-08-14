import { Link } from '@remix-run/react';
import { ThemeToggle } from '@/components/shared';
import { PageContainer, PageRow, PageSection } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { useCurrentUser } from '@/providers';

export function PublicHeader() {
  const { isLoggedIn, user } = useCurrentUser();

  return (
    <PageSection
      spacing="none"
      className="sticky top-0 z-20 border-b border-[var(--rootly-border)] bg-[var(--rootly-background)]/90 backdrop-blur"
    >
      <PageContainer className="flex h-28 items-center justify-between py-0">
        <Link to="/" aria-label="Rootly garden planner home">
          <img
            src="/rootly-logo.png"
            alt="Rootly garden planner logo"
            width={1536}
            height={800}
            className="h-20 w-auto max-w-[280px] object-contain object-left sm:h-24 sm:max-w-[340px]"
          />
        </Link>
        <PageRow as="nav" gap="sm" align="center">
          <ThemeToggle />
          {isLoggedIn ? (
            <>
              <span className="hidden text-sm font-medium text-[var(--rootly-text-muted)] sm:inline">
                Hi, {user?.firstName}
              </span>
              <Button asChild size="sm">
                <Link to="/dashboard">Go to dashboard</Link>
              </Button>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link to="/login">Login</Link>
              </Button>
              <Button asChild size="sm">
                <Link to="/register">Register</Link>
              </Button>
            </>
          )}
        </PageRow>
      </PageContainer>
    </PageSection>
  );
}
