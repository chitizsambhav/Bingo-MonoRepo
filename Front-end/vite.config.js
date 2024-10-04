import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Ensure @splinetool is in its own chunk
          if (id.includes('node_modules/@splinetool')) {
            return 'splinetool';
          }

          // Split common libraries into smaller chunks
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'react'; // React and ReactDOM in their own chunk
          }

          // Split utility libraries or specific modules
          if (id.includes('node_modules/lodash')) {
            return 'lodash'; // lodash in its own chunk
          }

          // General chunking logic for other dependencies
          if (id.includes('node_modules')) {
            const moduleName = id.split('node_modules/')[1].split('/')[0];
            return moduleName; // Each module will be its own chunk
          }
        }
      }
    }
  }
});
