const root = __dirname;

module.exports = {
  apps: [
    {
      name: 'home-garden-api',
      cwd: root,
      script: 'apps/api/dist/main.js',
      exec_mode: 'fork',
      instances: 1,
      watch: false,
      autorestart: true,
      max_memory_restart: '256M',
      env: {
        NODE_ENV: 'production',
        HOST: '0.0.0.0',
        PORT: '3000',
      },
    },
    {
      name: 'home-garden-web',
      cwd: root,
      script: 'node_modules/@remix-run/serve/dist/cli.js',
      args: 'apps/web/build/server/index.js',
      exec_mode: 'fork',
      instances: 1,
      watch: false,
      autorestart: true,
      max_memory_restart: '256M',
      env: {
        NODE_ENV: 'production',
        PORT: '3001',
      },
    },
  ],
};
