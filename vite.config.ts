import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    watch: {
      ignored: [
        '**/backend/**',
        '**/docs/**',
        '**/.git/**',
        '**/*.db',
        '**/*.db-wal',
        '**/*.db-shm',
        '**/*.yaml',
        '**/*.yml',
        '**/*.txt',
        '**/*.log',
        '**/scratch/**',
      ],
    },
  },
  define: {
    'process.env': {},
  },
  resolve: {
    alias: {
      'ioredis': path.resolve(__dirname, './src/empty-polyfill.ts'),
      '@packages/standards': path.resolve(__dirname, '../packages/standards/src/index.ts'),
      '@packages/standards/': path.resolve(__dirname, '../packages/standards/src/'),
      '@packages/events': path.resolve(__dirname, '../packages/events/src/index.ts'),
      '@packages/events/': path.resolve(__dirname, '../packages/events/src/'),
      '@packages/auth': path.resolve(__dirname, '../packages/auth/src/index.ts'),
      '@packages/auth/': path.resolve(__dirname, '../packages/auth/src/'),
      '@packages/rbac': path.resolve(__dirname, '../packages/rbac/src/index.ts'),
      '@packages/rbac/': path.resolve(__dirname, '../packages/rbac/src/'),
    },
  },
});
