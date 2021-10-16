import { defineConfig } from 'vite'
import react from 'vite-plugin-swc-react'

export default defineConfig({
  plugins: [
    react(),
  ],
})
