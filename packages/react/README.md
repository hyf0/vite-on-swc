# features

- [Speedy Compiling in SWC](https://swc.rs/docs/configuring-swc)
- HMR Support in React Refresh
- [New JSX Transform](https://reactjs.org/blog/2020/09/22/introducing-the-new-jsx-transform.html)
- [Automatic Polyfill and Transpiler in SWC](https://swc.rs/docs/preset-env)

# Using template

```
npx degit iheyunfei/vite-swc-react-ts my-project
// or using javascript template
npx degit iheyunfei/vite-swc-react my-project

cd my-project

npm install
npm run dev
```

# install

```
yarn add -D vite-plugin-swc-react
// or
npm install -D vite-plugin-swc-react
```

# Usage

```ts
import { defineConfig } from 'vite'
import swcReact from 'vite-plugin-swc-react'

export default defineConfig({
  plugins: [swcReact()],
})
```

## Polyfill and Transpiler

**tl;dr. Do not worry about the polyfill unless your target browser only supports ES5.**

- `vite-plugin-swc-react` using the [suggested browserslist](https://vitejs.dev/guide/build.html#browser-compatibility) as default options to determine whether to import what polyfill and transpile syntax.

- `vite-plugin-swc-react` respects `.swcrc` and `browserslist`, If you wan't customize the target browsers, see [preset-env](https://swc.rs/docs/preset-env) options.

### ES5

If your target browser only supports ES5, you may want to checkout  [`@vitejs/plugin-legacy`](https://github.com/vitejs/vite/tree/main/packages/plugin-legacy).

And remember to disable the behavior of polyfill and transpiling in `vite-plugin-swc-react` by passing options like

```ts
export default defineConfig({
  plugins: [
    react({
      swcOptions: {
        env: {
          targets: []
        }
      }
    }),
  ],
})
```

## disable HMR

```ts
import { defineConfig } from 'vite'
import swcReact from 'vite-plugin-swc-react'

export default defineConfig({
  plugins: [
    swcReact({
      reactFresh: false,
    }),
  ],
})
```

## classic JSX runtime

```ts
import { defineConfig } from 'vite'
import swcReact from 'vite-plugin-swc-react'

export default defineConfig({
  plugins: [
    swcReact({
      swcOptions: {
        jsc: {
          transform: {
            react: {
              runtime: 'classic',
            },
          },
        },
      },
    }),
  ],
})
```
