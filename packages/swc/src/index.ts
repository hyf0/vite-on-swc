import {
  Options as SWCOptions,
  transform,
} from '@swc/core'
import { PluginOption } from 'vite'
import merge from 'lodash.merge'


export default function swc(
  options: {
    swcOptions?: SWCOptions
  } = {},
): PluginOption[] {
  const {
    swcOptions = {},
  } = options
  return [
    {
      name: 'vite-plugin-swc',
      enforce: 'pre',
      async transform(code, id) {
        if (/\.(js|[tj]sx?)$/.test(id)) {
          const transformed = await transform(code, merge({}, swcOptions))
          return transformed
        }
      },
    },
  ]
}
