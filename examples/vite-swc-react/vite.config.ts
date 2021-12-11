import { defineConfig } from 'vite'
import swcReact from 'vite-plugin-swc-react'
import inspect from 'vite-plugin-inspect'

export default defineConfig({
  plugins: [
    swcReact(),
    inspect(),
  ],
})
