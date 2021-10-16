# vite-on-swc

## [vite-plugin-swc-react](./packages/react/README.md)

### features

- [Speedy Compiling in SWC](https://swc.rs/docs/configuring-swc)
- HMR Support in React Refresh
- [New JSX Transform](https://reactjs.org/blog/2020/09/22/introducing-the-new-jsx-transform.html)

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