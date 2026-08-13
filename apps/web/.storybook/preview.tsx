import type { Preview } from '@storybook/react-vite';
import { AppProviders } from '@/providers';
import '../app/styles/global.css';

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    layout: 'centered',
    backgrounds: {
      default: 'Rootly Light',
      values: [
        { name: 'Rootly Light', value: '#FAF8F3' },
        { name: 'Rootly Dark', value: '#101611' },
      ],
    },
  },
  decorators: [
    (Story, context) => {
      const isDark = context.globals?.backgrounds?.value === '#101611';

      return (
        <div data-theme={isDark ? 'dark' : 'light'} className={isDark ? 'dark' : ''}>
          <AppProviders>
            <Story />
          </AppProviders>
        </div>
      );
    },
  ],
};

export default preview;
