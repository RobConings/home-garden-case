import { Form, Link } from '@remix-run/react';
import {
  CalendarDays,
  Flower2,
  LayoutDashboard,
  LogOut,
  Plus,
  Settings,
  Sprout,
} from 'lucide-react';
import { AppShell, PageContainer, PageGrid, PageRow, PageStack } from '@/components/layout';
import { BrandMark, EmptyState, PageTitle, StatCard, ThemeToggle } from '@/components/shared';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { UserSession } from '@/lib/session.server';

type DashboardShellProps = {
  user: UserSession;
};

const navItems = [
  { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
  { label: 'Gardens', to: '/dashboard', icon: Sprout },
  { label: 'Plants', to: '/dashboard', icon: Flower2 },
  { label: 'Care', to: '/dashboard', icon: CalendarDays },
  { label: 'Settings', to: '/dashboard', icon: Settings },
];

export function DashboardShell({ user }: DashboardShellProps) {
  const displayName = `${user.firstName} ${user.lastName}`.trim();

  return (
    <AppShell header={<DashboardHeader user={user} />} sidebar={<DashboardSidebar />}>
      <PageContainer minHeight="content" className="py-8">
        <PageStack gap="lg">
          <PageTitle
            eyebrow="Garden workspace"
            title={`Welcome back, ${user.firstName}`}
            description="Your gardens, plantings, and care reminders are ready to organize."
            actions={
              <Button>
                <Plus aria-hidden="true" className="h-4 w-4" />
                Add garden
              </Button>
            }
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
                description="Add a garden to track planting space, locations, and the plants growing there."
                action={
                  <Button>
                    <Plus aria-hidden="true" className="h-4 w-4" />
                    Add garden
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
    </AppShell>
  );
}

function DashboardHeader({ user }: DashboardShellProps) {
  return (
    <PageContainer className="flex h-16 items-center justify-between py-0">
      <Link to="/dashboard" aria-label="Rootly dashboard">
        <BrandMark compact />
      </Link>
      <PageRow align="center" gap="sm">
        <ThemeToggle />
        <span className="hidden text-sm font-medium text-[var(--rootly-text-muted)] sm:inline">
          {user.firstName}
        </span>
      </PageRow>
    </PageContainer>
  );
}

function DashboardSidebar() {
  return (
    <nav className="grid gap-1 p-4">
      {navItems.map((item) => {
        const Icon = item.icon;

        return (
          <Button
            key={item.label}
            asChild
            variant={item.label === 'Dashboard' ? 'subtle' : 'ghost'}
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
