import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import path, { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, type Plugin } from 'vite';

const webRoot = dirname(dirname(fileURLToPath(import.meta.url)));

function resolveDirectoryIndexes(): Plugin {
  return {
    name: 'resolve-directory-indexes',

    enforce: 'pre',

    async resolveId(source, importer) {
      if (!importer) {
        return null;
      }

      let candidate: string | null = null;

      if (source.startsWith('@/')) {
        candidate = path.resolve(webRoot, 'app', source.slice(2));
      } else if (source.startsWith('.')) {
        candidate = path.resolve(path.dirname(importer), source);
      }

      if (!candidate) {
        return null;
      }

      try {
        if (!fs.statSync(candidate).isDirectory()) {
          return null;
        }
      } catch {
        return null;
      }

      const indexFiles = ['index.ts', 'index.tsx', 'index.js', 'index.jsx'];

      for (const indexFile of indexFiles) {
        const resolved = path.join(candidate, indexFile);

        if (fs.existsSync(resolved)) {
          return resolved;
        }
      }

      return null;
    },
  };
}

export default defineConfig({
  root: webRoot,

  plugins: [resolveDirectoryIndexes(), react(), nxViteTsPaths(), tailwindcss()],
});
