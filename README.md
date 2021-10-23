# Plugins

## [vite-plugin-swc-react](./packages/react)

### features

- [Speedy Compiling in SWC](https://swc.rs/docs/configuring-swc)
- HMR Support in React Refresh
- [New JSX Transform](https://reactjs.org/blog/2020/09/22/introducing-the-new-jsx-transform.html)
- [Polyfill and Transpiler in SWC](https://swc.rs/docs/preset-env)

### Using template

```
npx degit iheyunfei/vite-swc-react-ts my-project
// or using javascript template
npx degit iheyunfei/vite-swc-react my-project

cd my-project

npm install
npm run dev
```

### install

```
yarn add -D vite-plugin-swc-react
// or
npm install -D vite-plugin-swc-react
```

### Usage

```ts
import { defineConfig } from 'vite'
import swcReact from 'vite-plugin-swc-react'

export default defineConfig({
  plugins: [swcReact()],
})
```

#### Polyfill and Transpiler

To enable polyfill, you would need to

- install `browserlist` as a devDependency
- install `core-js` as a dependency
- pass options like

```ts
import { defineConfig } from 'vite'
import swcReact from 'vite-plugin-swc-react'

export default defineConfig({
  plugins: [
    swcReact({
      swcOptions: {
        env: {
          // https://vitejs.dev/guide/build.html#browser-compatibility
          targets: 'defaults and supports es6-module and supports es6-module-dynamic-import, not opera > 0, not samsung > 0, not and_qq > 0',
          mode: 'usage',
          coreJs: 3,
        }
      }
    }),
  ],
})

```

##### ES5

If your target browser only supports ES5, you may want to checkout  [`@vitejs/plugin-legacy`](https://github.com/vitejs/vite/tree/main/packages/plugin-legacy).

#### disable HMR

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

#### classic JSX runtime

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
