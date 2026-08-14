import { Form, Link } from '@remix-run/react';
import { useState, type ReactNode } from 'react';
import {
  CalendarDays,
  Flower2,
  LayoutDashboard,
  LogOut,
  Map,
  Pencil,
  Plus,
  Sprout,
} from 'lucide-react';
import { AppShell, PageContainer, PageGrid, PageRow, PageStack } from '@/components/layout';
import { EmptyState, PageTitle, StatCard, ThemeToggle } from '@/components/shared';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Garden } from '@/features/gardens/api';
import { type CurrentUser, useCurrentUser } from '@/providers';
import { DashboardSidebar } from './dashboard-sidebar';

type DashboardShellProps = {
  children?: ReactNode;
};

export type DashboardStats = {
  gardenCount: number;
  plantCount: number;
  careTaskCount: number;
  growingAreaM2: number;
};

const emptyDashboardStats: DashboardStats = {
  gardenCount: 0,
  plantCount: 0,
  careTaskCount: 0,
  growingAreaM2: 0,
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

export function DashboardHome({
  stats = emptyDashboardStats,
  recentGardens = [],
}: {
  stats?: DashboardStats;
  recentGardens?: Garden[];
}) {
  const user = useRequiredCurrentUser();
  const displayName =
    [user.firstName, user.lastName].filter(Boolean).join(' ') || 'Rootly gardener';
  const firstName = user.firstName || 'gardener';
  const formattedGrowingArea = `${formatSquareMeters(stats.growingAreaM2)} m2`;

  return (
    <PageContainer minHeight="content" className="py-8">
      <PageStack gap="lg">
        <PageTitle
          eyebrow="Garden workspace"
          title={`Welcome back, ${firstName}`}
          description="Your gardens, plantings, and care reminders are ready to organize."
        />

        <PageGrid columns={4} gap="sm">
          <StatCard
            label="Gardens"
            value={String(stats.gardenCount)}
            description={stats.gardenCount === 1 ? 'Garden planned' : 'Gardens planned'}
            icon={Sprout}
          />
          <StatCard
            label="Plants"
            value={String(stats.plantCount)}
            description="Plant library entries"
            icon={Flower2}
          />
          <StatCard
            label="Care tasks"
            value={String(stats.careTaskCount)}
            description={stats.careTaskCount === 0 ? 'Nothing due today' : 'Due today'}
            icon={CalendarDays}
          />
          <StatCard
            label="Growing area"
            value={formattedGrowingArea}
            description="Total mapped space"
            icon={LayoutDashboard}
          />
        </PageGrid>

        <PageGrid layout="rightSidebar" gap="md" align="start">
          <section className="lg:[grid-area:main]">
            {recentGardens.length > 0 ? (
              <PageStack gap="sm">
                <PageRow align="between" gap="sm">
                  <div>
                    <h2 className="text-lg font-semibold text-[var(--rootly-text)]">
                      Recently updated gardens
                    </h2>
                    <p className="mt-1 text-sm text-[var(--rootly-text-muted)]">
                      Continue planning your latest growing spaces.
                    </p>
                  </div>
                  <Button asChild variant="secondary">
                    <Link to="/dashboard/gardens">View all</Link>
                  </Button>
                </PageRow>
                <PageGrid columns={3} gap="sm">
                  {recentGardens.map((garden) => (
                    <RecentGardenCard key={garden.gardenId} garden={garden} />
                  ))}
                </PageGrid>
              </PageStack>
            ) : (
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
            )}
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

function RecentGardenCard({ garden }: { garden: Garden }) {
  return (
    <Card className="h-full">
      <CardHeader>
        <PageRow align="between" gap="sm">
          <CardTitle>{garden.gardenName}</CardTitle>
          <Badge variant="success">{formatSunDirection(garden.sunDirection)}</Badge>
        </PageRow>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid gap-2 text-sm text-[var(--rootly-text-muted)]">
          <p>
            <span className="font-medium text-[var(--rootly-text)]">Size:</span>{' '}
            {formatSquareMeters(garden.totalSurfaceArea)} m2
          </p>
          <p>
            <span className="font-medium text-[var(--rootly-text)]">Updated:</span>{' '}
            {formatUpdatedDate(garden.updatedAt)}
          </p>
        </div>
        <PageRow align="end" gap="sm">
          <Button asChild variant="subtle" size="sm">
            <Link to={`/dashboard/gardens/${garden.gardenId}/editor`}>
              <Map aria-hidden="true" className="h-3.5 w-3.5" />
              Editor
            </Link>
          </Button>
          <Button asChild variant="secondary" size="sm">
            <Link to={`/dashboard/gardens/${garden.gardenId}/edit`}>
              <Pencil aria-hidden="true" className="h-3.5 w-3.5" />
              Edit
            </Link>
          </Button>
        </PageRow>
      </CardContent>
    </Card>
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

function formatSquareMeters(value: number) {
  if (value === 0) {
    return '0';
  }

  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

function formatSunDirection(value: Garden['sunDirection']) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function formatUpdatedDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Recently';
  }

  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}
