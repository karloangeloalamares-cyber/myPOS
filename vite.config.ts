import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  // Prefer explicit env ports, fallback to 3001
  const configuredPort = Number(env.VITE_PORT || env.PORT) || 3001;
  return {
    server: {
      port: configuredPort,
      // Allow Vite to choose the next free port if busy
      strictPort: false,
      host: '0.0.0.0',
    },
    preview: {
      port: configuredPort,
      strictPort: false,
      host: '0.0.0.0',
    },
    plugins: [react()],
    // Removed Gemini env defs when AI feature is disabled
    define: {},
      resolve: {
        alias: {
          '@': path.resolve(__dirname, './src'),
        }
      }
  };
});
