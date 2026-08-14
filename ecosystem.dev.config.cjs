const root = __dirname;

module.exports = {
  apps: [
    {
      name: 'home-garden-api-dev',
      cwd: root,
      script: 'node_modules/nx/bin/nx.js',
      args: 'dev api',
      exec_mode: 'fork',
      instances: 1,
      watch: false,
      autorestart: true,
      env: {
        NODE_ENV: 'development',
        NX_DAEMON: 'false',
        HOST: '0.0.0.0',
        PORT: '3100',
      },
    },
    {
      name: 'home-garden-web-dev',
      cwd: root,
      script: 'node_modules/nx/bin/nx.js',
      args: 'dev web --host 0.0.0.0 --port 3101',
      exec_mode: 'fork',
      instances: 1,
      watch: false,
      autorestart: true,
      env: {
        NODE_ENV: 'development',
        NX_DAEMON: 'false',
        API_BASE_URL: 'http://127.0.0.1:3100',
        PORT: '3101',
      },
    },
    {
      name: 'home-garden-storybook-dev',
      cwd: root,
      script: 'node_modules/nx/bin/nx.js',
      args: 'storybook @itp-home-garden/web --host 0.0.0.0 --port 6006',
      exec_mode: 'fork',
      instances: 1,
      watch: false,
      autorestart: true,
      env: {
        NODE_ENV: 'development',
        NX_DAEMON: 'false',
        PORT: '6006',
      },
    },
  ],
};
