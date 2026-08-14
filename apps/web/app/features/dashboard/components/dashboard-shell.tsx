import { Form, Link, useLocation } from '@remix-run/react';
import type { ReactNode } from 'react';
import {
  CalendarDays,
  Flower2,
  LayoutDashboard,
  LogOut,
  Plus,
  Sprout,
} from 'lucide-react';
import { AppShell, PageContainer, PageGrid, PageRow, PageStack } from '@/components/layout';
import { EmptyState, PageTitle, StatCard, ThemeToggle } from '@/components/shared';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { UserSession } from '@/lib/session.server';

type DashboardShellProps = {
  user: UserSession;
  children?: ReactNode;
};

const navItems = [
  { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard, activePath: '/dashboard' },
  { label: 'Gardens', to: '/dashboard/gardens', icon: Sprout, activePath: '/dashboard/gardens' },
  { label: 'Plants', to: '/dashboard/plants', icon: Flower2, activePath: '/dashboard/plants' },
  { label: 'Care', to: '/dashboard', icon: CalendarDays },
];

export function DashboardShell({ user, children }: DashboardShellProps) {
  return (
    <AppShell header={<DashboardHeader user={user} />} sidebar={<DashboardSidebar />}>
      {children ?? <DashboardHome user={user} />}
    </AppShell>
  );
}

export function DashboardHome({ user }: DashboardShellProps) {
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

function DashboardHeader({ user }: DashboardShellProps) {
  return (
    <PageContainer className="flex h-16 items-center justify-between py-0">
      <Link to="/dashboard" aria-label="Go to Rootly dashboard">
        <img
          src="/rootly-logo.png"
          alt="Rootly garden planner logo"
          width={1536}
          height={800}
          className="h-12 w-auto max-w-[170px] object-contain object-left"
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

function DashboardSidebar() {
  const location = useLocation();

  return (
    <nav className="grid gap-1 p-4">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = item.activePath ? location.pathname === item.activePath : false;

        return (
          <Button
            key={item.label}
            asChild
            variant={isActive ? 'subtle' : 'ghost'}
            className="justify-start"
          >
            <Link to={item.to}>
              <Icon aria-hidden="true" className="h-4 w-4" />
              {item.label}
            </Link>
          </Button>
        );
      })}
    </nav>
  );
}
