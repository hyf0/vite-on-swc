import { defineConfig } from 'vite'
import react from 'vite-plugin-swc-react'

export default defineConfig({
  plugins: [
    react({
      swcOptions: {
        env: {
          targets: 'defaults and supports es6-module and supports es6-module-dynamic-import, not opera > 0, not samsung > 0, not and_qq > 0',
        }
      }
    }),
  ],
})
