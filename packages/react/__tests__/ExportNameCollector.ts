import * as swc from '@swc/core'
import ExportNameCollector from '../src/ExportNameCollector'

describe('ReactRefreshBoundaryCollector', () => {
  const cases = [
    {
      code: `export default Foo;`,
      isAbsolutelyNotReactRefreshBoundary: false,
    },
    {
      code: `export default foo;`,
      isAbsolutelyNotReactRefreshBoundary: true,
    },
    {
      code: `export default memo(Foo);`,
      isAbsolutelyNotReactRefreshBoundary: false,
    },
    {
      code: `export default memo(foo);`,
      isAbsolutelyNotReactRefreshBoundary: true,
    },
    // export default [function / class] ...
    {
      code: `export default function Foo() {};`,
      isAbsolutelyNotReactRefreshBoundary: false,
    },
    {
      code: `export default class Foo {}`,
      isAbsolutelyNotReactRefreshBoundary: true,
    },
    {
      code: `export default function foo() {};`,
      isAbsolutelyNotReactRefreshBoundary: true,
    },
    {
      code: `export default class foo {}`,
      isAbsolutelyNotReactRefreshBoundary: true,
    },
    // export 
    {
      code: `export { Foo }`,
      isAbsolutelyNotReactRefreshBoundary: false,
    },
    {
      code: `export { foo }`,
      isAbsolutelyNotReactRefreshBoundary: true,
    },
    {
      code: `export { Foo, baz }`,
      isAbsolutelyNotReactRefreshBoundary: true,
    },
    
    // export 
    {
      code: `export * as Foo from './foo.js'`,
      isAbsolutelyNotReactRefreshBoundary: true,
    },
    {
      code: `export { Foo } from './foo.js'`,
      isAbsolutelyNotReactRefreshBoundary: false,
    },
    {
      code: `export { Foo as foo } from './foo.js'`,
      isAbsolutelyNotReactRefreshBoundary: true,
    },
    {
      code: `export { foo as Foo } from './foo.js'`,
      isAbsolutelyNotReactRefreshBoundary: false,
    },
    {
      code: `export { foo } from './foo.js'`,
      isAbsolutelyNotReactRefreshBoundary: true,
    },
    {
      code: `export { Foo, baz } from './foo.js'`,
      isAbsolutelyNotReactRefreshBoundary: true,
    },
    {
      code: `export { Foo as default }`,
      isAbsolutelyNotReactRefreshBoundary: false,
    },
    {
      code: `export { foo as default }`,
      isAbsolutelyNotReactRefreshBoundary: true,
    },
    {
      code: `export { default as Foo }`,
      isAbsolutelyNotReactRefreshBoundary: false,
    },
    {
      code: `export { default as foo }`,
      isAbsolutelyNotReactRefreshBoundary: true,
    },
    {
      code: `export function Foo() {}`,
      isAbsolutelyNotReactRefreshBoundary: false,
    },
    {
      code: `export function foo() {}`,
      isAbsolutelyNotReactRefreshBoundary: true,
    },
    {
      code: `export class Foo {}`,
      isAbsolutelyNotReactRefreshBoundary: true,
    },
    {
      code: `export class foo {}`,
      isAbsolutelyNotReactRefreshBoundary: true,
    },
  ]

  cases.forEach((aCase) => {
    test(`${aCase.code.slice(0, 30)} should be ${aCase.isAbsolutelyNotReactRefreshBoundary}`, () => {
      const c = new ExportNameCollector();
      swc.transformSync(
        `${aCase.code}`,
        {
          jsc: {
            parser: {
              syntax: 'typescript',
              tsx: true,
            },
          },
          plugin: swc.plugins([(p) => c.visitProgram(p)]),
        },
      )
      expect(c.isAbsolutelyNotReactRefreshBoundary).toBe(aCase.isAbsolutelyNotReactRefreshBoundary)
    })
  })
})
