import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const webRoot = dirname(dirname(fileURLToPath(import.meta.url)));

export default defineConfig({
  root: webRoot,
  plugins: [react(), nxViteTsPaths(), tailwindcss()],
});
