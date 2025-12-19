import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Base path for GitHub Pages (only in production)
  base: process.env.NODE_ENV === 'production' ? '/bennet-geburtstag/' : '/',
})
