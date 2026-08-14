import { Link, useLocation } from '@remix-run/react';
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Flower2,
  LayoutDashboard,
  Sprout,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const navItems = [
  { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard, activePath: '/dashboard' },
  { label: 'Gardens', to: '/dashboard/gardens', icon: Sprout, activePath: '/dashboard/gardens' },
  { label: 'Plants', to: '/dashboard/plants', icon: Flower2, activePath: '/dashboard/plants' },
  { label: 'Care', to: '/dashboard/care', icon: CalendarDays, activePath: '/dashboard/care' },
];

export function DashboardSidebar({
  collapsed,
  onCollapsedChange,
}: {
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
}) {
  const location = useLocation();

  return (
    <nav
      className={cn(
        'flex h-full flex-col gap-2 p-3 transition-[width] duration-200',
        collapsed ? 'w-[72px]' : 'w-64',
      )}
      aria-label="Dashboard navigation"
    >
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="mb-2 self-end"
        onClick={() => onCollapsedChange(!collapsed)}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? (
          <ChevronRight aria-hidden="true" className="h-4 w-4" />
        ) : (
          <ChevronLeft aria-hidden="true" className="h-4 w-4" />
        )}
      </Button>

      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = item.activePath
          ? location.pathname === item.activePath ||
            (item.activePath !== '/dashboard' && location.pathname.startsWith(item.activePath))
          : false;

        return (
          <Button
            key={item.label}
            asChild
            variant={isActive ? 'subtle' : 'ghost'}
            size={collapsed ? 'icon' : 'md'}
            className={cn(!collapsed && 'justify-start')}
            title={collapsed ? item.label : undefined}
          >
            <Link to={item.to} aria-label={collapsed ? item.label : undefined}>
              <Icon aria-hidden="true" className="h-4 w-4" />
              {collapsed ? null : item.label}
            </Link>
          </Button>
        );
      })}
    </nav>
  );
}
