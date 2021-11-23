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
import ExportNameCollector from './ExportNameCollector'

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

  const ctx = {
    get isEnableReactRefresh() {
      return isDevelopment && reactFresh
    },
  }

  return [
    {
      name: 'vite-plugin-swc-react',
      enforce: 'pre',
      config(config, env) {
        isDevelopment = env.mode === 'development'

        // Disable esbuild for transforming
        config.esbuild = false
      },
      transformIndexHtml() {
        if (ctx.isEnableReactRefresh) {
          // Inject react refresh runtime
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
        if (!id.includes('node_modules') && /\.(js|mjs|jsx|ts|tsx)$/.test(id)) {
          const isTS = /\.(ts|tsx)$/.test(id)
          const is_SX = !id.endsWith('.ts')

          const collector =
            isDevelopment && is_SX ? new ExportNameCollector() : null

          const options: SWCOptions = {
            ...(collector
              ? {
                  plugin: swc.plugins([(p) => collector.visitProgram(p)]),
                }
              : null),
            filename: id,
            jsc: {
              target: 'es2021',
              parser: {
                syntax: isTS ? 'typescript' : 'ecmascript',
                [isTS ? 'tsx' : 'jsx']: is_SX,
              },
              transform: {
                react: {
                  development: isDevelopment,
                  runtime: jsxRuntime,
                  refresh: ctx.isEnableReactRefresh,
                },
              },
            },
          }

          const resolveSWCOptions = merge(options, swcOptions)

          const transformed = await swc.transform(code, resolveSWCOptions)

          return {
            ...transformed,
            code:
              isDevelopment && reactFresh && collector
                ? addReactFreshWrapper(
                    id,
                    transformed.code,
                    collector
                  )
                : transformed.code,
          }
        }
      },
    },
  ]
}