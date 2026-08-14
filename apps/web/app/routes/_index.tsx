import type { MetaFunction } from '@remix-run/node';
import { Link } from '@remix-run/react';
import { PageGrid, PageStack } from '@/components/layout';
import { Banner } from '@/components/shared';
import { PublicHeader, SellingPoints } from '@/features/marketing/components';
import { Button } from '@/components/ui/button';

export const meta: MetaFunction = () => [
  {
    title: 'Rootly | Garden Planning Dashboard for Plants, Beds, and Care',
  },
  {
    name: 'description',
    content:
      'Rootly helps home gardeners design gardens, choose plants, plan sunlight, and manage watering and nutrition from one calm garden planning dashboard.',
  },
  {
    name: 'robots',
    content: 'index,follow',
  },
  {
    name: 'keywords',
    content:
      'garden planner, home garden planning, plant care dashboard, watering reminders, raised bed planner',
  },
  { property: 'og:type', content: 'website' },
  { property: 'og:site_name', content: 'Rootly' },
  { property: 'og:title', content: 'Rootly garden planning dashboard' },
  {
    property: 'og:description',
    content:
      'Design your garden, pick the right plants, and stay ahead of watering, nutrition, and sunlight needs.',
  },
  { property: 'og:image', content: '/banner.png' },
  {
    property: 'og:image:alt',
    content: 'Sunny home garden with raised beds, herbs, flowers, and a garden shed',
  },
  { name: 'twitter:card', content: 'summary_large_image' },
  { name: 'twitter:title', content: 'Rootly garden planning dashboard' },
  {
    name: 'twitter:description',
    content:
      'Design your garden, choose plants, and manage watering, nutrition, and sunlight from one calm dashboard.',
  },
  { name: 'twitter:image', content: '/banner.png' },
  {
    name: 'twitter:image:alt',
    content: 'Sunny home garden with raised beds, herbs, flowers, and a garden shed',
  },
];

export default function Index() {
  return (
    <PageStack
      className="min-h-screen bg-[var(--rootly-background)] text-[var(--rootly-text)]"
      gap="none"
    >
      <PublicHeader />
      <PageGrid layout="oneColumn">
        <Banner
          badge="Garden planning, without guesswork"
          title="Rootly"
          description="Design your garden, pick the right plants, and stay ahead of watering, nutrition, and sunlight needs from one calm planning dashboard."
          imageSrc="/banner.png"
          imageAlt="Sunny home vegetable garden with raised beds, herbs, flowers, and a garden shed for Rootly garden planning"
          imageWidth={1916}
          imageHeight={821}
          actions={
            <div className="flex flex-wrap gap-4">
              <Button asChild size="lg">
                <Link to="/register">Start planning</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="secondary"
                className="bg-white/10 text-white hover:bg-white/15"
              >
                <Link to="/login">I already have an account</Link>
              </Button>
            </div>
          }
        />
        <SellingPoints />
      </PageGrid>
    </PageStack>
  );
}
