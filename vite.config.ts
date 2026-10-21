import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// GitHub Pages serves the site from /<repo-name>/. Override with BASE_PATH if needed.
export default defineConfig({
  base: process.env.BASE_PATH ?? '/Knowledge/',
  plugins: [react(), tailwindcss()],
})
