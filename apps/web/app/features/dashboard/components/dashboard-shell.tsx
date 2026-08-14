import { Form, Link } from '@remix-run/react';
import { useState, type ReactNode } from 'react';
import { CalendarDays, Flower2, LayoutDashboard, LogOut, Plus, Sprout } from 'lucide-react';
import { AppShell, PageContainer, PageGrid, PageRow, PageStack } from '@/components/layout';
import { EmptyState, PageTitle, StatCard, ThemeToggle } from '@/components/shared';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { type CurrentUser, useCurrentUser } from '@/providers';
import { DashboardSidebar } from './dashboard-sidebar';

type DashboardShellProps = {
  children?: ReactNode;
};

export function DashboardShell({ children }: DashboardShellProps) {
  const user = useRequiredCurrentUser();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <AppShell
      header={<DashboardHeader user={user} />}
      sidebar={
        <DashboardSidebar
          collapsed={isSidebarCollapsed}
          onCollapsedChange={setIsSidebarCollapsed}
        />
      }
    >
      {children ?? <DashboardHome />}
    </AppShell>
  );
}

export function DashboardHome() {
  const user = useRequiredCurrentUser();
  const displayName =
    [user.firstName, user.lastName].filter(Boolean).join(' ') || 'Rootly gardener';
  const firstName = user.firstName || 'gardener';

  return (
    <PageContainer minHeight="content" className="py-8">
      <PageStack gap="lg">
        <PageTitle
          eyebrow="Garden workspace"
          title={`Welcome back, ${firstName}`}
          description="Your gardens, plantings, and care reminders are ready to organize."
        />

        <PageGrid columns={4} gap="sm">
          <StatCard label="Gardens" value="0" description="Ready to plan" icon={Sprout} />
          <StatCard label="Plants" value="0" description="Catalog your beds" icon={Flower2} />
          <StatCard
            label="Care tasks"
            value="0"
            description="Nothing due today"
            icon={CalendarDays}
          />
          <StatCard
            label="Growing area"
            value="0 m2"
            description="Map your space"
            icon={LayoutDashboard}
          />
        </PageGrid>

        <PageGrid layout="rightSidebar" gap="md" align="start">
          <section className="lg:[grid-area:main]">
            <EmptyState
              title="Start with your first garden"
              description="Add a garden to track planting space and the plants growing there."
              action={
                <Button asChild>
                  <Link to="/dashboard/gardens/new">
                    <Plus aria-hidden="true" className="h-4 w-4" />
                    Add garden
                  </Link>
                </Button>
              }
            />
          </section>

          <aside className="lg:[grid-area:sidebar]">
            <Card>
              <CardHeader>
                <PageRow align="between" gap="sm">
                  <CardTitle>Account</CardTitle>
                  <Badge variant="success">Active</Badge>
                </PageRow>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div>
                  <p className="text-sm font-medium text-[var(--rootly-text)]">{displayName}</p>
                  <p className="mt-1 break-all text-sm text-[var(--rootly-text-muted)]">
                    {user.emailAddress}
                  </p>
                </div>
                <Form method="post" action="/logout">
                  <Button type="submit" variant="secondary" className="w-full">
                    <LogOut aria-hidden="true" className="h-4 w-4" />
                    Logout
                  </Button>
                </Form>
              </CardContent>
            </Card>
          </aside>
        </PageGrid>
      </PageStack>
    </PageContainer>
  );
}

function DashboardHeader({ user }: { user: CurrentUser }) {
  return (
    <PageContainer size="full" className="flex h-16 items-center justify-between py-0">
      <Link to="/dashboard" aria-label="Go to Rootly dashboard" className="flex items-center">
        <img
          src="/rootly-logo.png"
          alt="Rootly garden planner logo"
          width={1536}
          height={800}
          className="h-14 w-auto max-w-[220px] object-contain object-left"
        />
      </Link>
      <PageRow align="center" gap="sm">
        <ThemeToggle />
        <span className="hidden text-sm font-medium text-[var(--rootly-text-muted)] sm:inline">
          {user.firstName || user.emailAddress}
        </span>
      </PageRow>
    </PageContainer>
  );
}

function useRequiredCurrentUser() {
  const { user } = useCurrentUser();

  if (!user) {
    throw new Error('Dashboard routes require an authenticated user.');
  }

  return user;
}
