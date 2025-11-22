import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, (process as any).cwd(), '');

  return {
    plugins: [react()],
    define: {
      // This ensures process.env.API_KEY is available in the code after build
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
    },
    build: {
      // Increase the warning limit to 4000KB (4MB) to suppress the chunk size warning for the large projectCode file
      chunkSizeWarningLimit: 4000,
      rollupOptions: {
        output: {
          manualChunks: {
            // Separate vendor libraries
            vendor: ['react', 'react-dom', '@google/genai'],
            // Separate the large project context file to keep the main bundle smaller
            projectCode: ['./utils/projectCode.ts'],
          },
        },
      },
    },
  };
});