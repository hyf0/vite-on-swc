import * as swc from '@swc/core'
import {
  Options as SWCOptions,
  TsParserConfig,
  EsParserConfig,
} from '@swc/core'
import { PluginOption } from 'vite'
import merge from 'lodash.merge'
import {
  addReactFreshWrapper,
  reactRefreshRuntimeCode,
} from './react-refresh-helper'

export default function swcReact(
  options: {
    /**
     * @default true
     */
    reactFresh?: boolean
    /**
     * @default 'automatic'
     */
    jsxRuntime?: 'classic' | 'automatic'
    /**
     * See https://swc.rs/docs/configuring-swc
     */
    swcOptions?: SWCOptions
  } = {},
): PluginOption[] {
  const {
    reactFresh = true,
    swcOptions = {},
    jsxRuntime = 'automatic',
  } = options

  let isDevelopment = false

  return [
    {
      name: 'vite-plugin-swc-react',
      enforce: 'pre',
      config(_config, env) {
        isDevelopment = env.mode === 'development'
      },
      transformIndexHtml() {
        if (isDevelopment && reactFresh) {
          return [
            {
              tag: 'script',
              attrs: { type: 'module' },
              children: reactRefreshRuntimeCode,
            },
          ]
        }
      },
      async transform(code, id) {
        if (/\.(js|[tj]sx?)$/.test(id)) {
          let isTypescript = ['.ts', '.tsx'].some((p) => id.endsWith(p))
          let is_SX = ['.jsx', '.tsx'].some((p) => id.endsWith(p))

          const resolveSWCOptions: SWCOptions = merge(
            {
              filename: id,
              env: {
                // copied from https://vitejs.dev/guide/build.html
                targets:
                  'defaults and supports es6-module and supports es6-module-dynamic-import, not opera > 0, not samsung > 0, not and_qq > 0',
                mode: 'usage',
                coreJs: 3,
              },
              jsc: {
                parser: isTypescript
                  ? <TsParserConfig>{
                      syntax: 'typescript',
                      tsx: is_SX,
                    }
                  : <EsParserConfig>{
                      syntax: 'ecmascript',
                      jsx: is_SX,
                    },
                transform: {
                  react: {
                    development: isDevelopment,
                    runtime: jsxRuntime,
                    refresh: reactFresh,
                  },
                },
              },
              ...swcOptions,
            },
            swcOptions,
          )
          const transformed = await swc.transform(code, resolveSWCOptions)
          
          return {
            ...transformed,
            code:
              isDevelopment && reactFresh
                ? addReactFreshWrapper(id, transformed.code, is_SX) // FIXME: better checking for isReactRefreshBoundary
                : transformed.code,
          }
        }
      },
    },
  ]
}
