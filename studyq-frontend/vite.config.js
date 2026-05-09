import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks – keeps app bundle lean
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-three': ['three'],
          'vendor-charts': ['recharts'],
          'vendor-ui': ['axios', 'react-hot-toast', 'lucide-react'],
        },
      },
    },
  },
})
