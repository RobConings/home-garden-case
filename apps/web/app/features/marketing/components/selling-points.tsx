import { Droplets, LibraryBig, MapPinned, Sprout, SunMedium } from 'lucide-react';
import { ContentSection, PageContainer, PageRow, PageSection, PageStack } from '@/components/layout';
import { FeatureCard, NotificationCallout, PageTitle } from '@/components/shared';

const sellingPoints = [
  {
    title: 'Build a virtual garden',
    description:
      'Map out beds, patio planters, or backyard zones before you start planting in real life.',
    icon: Sprout,
  },
  {
    title: 'Plant from a library',
    description:
      'Choose vegetables, fruits, flowers, and herbs with their surface, humidity, and care needs.',
    icon: LibraryBig,
  },
  {
    title: 'Watering reminders',
    description:
      'Get timely watering and nutrition notifications based on the plants you are growing.',
    icon: Droplets,
  },
  {
    title: 'Sun-aware placement',
    description:
      'Position your garden and check whether plants receive the sunlight they need to thrive.',
    icon: SunMedium,
  },
];

export function SellingPoints() {
  return (
    <PageSection slot="main">
      <PageContainer>
        <PageStack gap="md">
          <PageTitle
            eyebrow="What Rootly helps with"
            title="Plan, place, and care for every plant."
            actions={
              <PageRow gap="sm" className="text-sm text-[var(--rootly-text-muted)]">
                <MapPinned className="h-4 w-4 text-[var(--rootly-accent)]" />
                Built for real gardens, balconies, and raised beds.
              </PageRow>
            }
          />
          <ContentSection layout="fourColumn" gap="sm">
            {sellingPoints.map((point) => (
              <FeatureCard key={point.title} {...point} />
            ))}
          </ContentSection>
          <ContentSection layout="oneColumn">
            <NotificationCallout
              title="Notifications that match the garden you actually planned."
              description="Rootly can use plant requirements, garden position, and care schedules to surface watering, nutrition, and sun-fit reminders."
            />
          </ContentSection>
        </PageStack>
      </PageContainer>
    </PageSection>
  );
}
