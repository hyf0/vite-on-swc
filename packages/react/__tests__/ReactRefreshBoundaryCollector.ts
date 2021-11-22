import * as swc from '@swc/core'
import ReactRefreshBoundaryCollector from '../src/ReactRefreshBoundaryCollector'

describe('ReactRefreshBoundaryCollector', () => {
  const cases = [
    {
      code: `export default Foo;`,
      result: true,
    },
    {
      code: `export default foo;`,
      result: false,
    },
    {
      code: `export default memo(Foo);`,
      result: true,
    },
    {
      code: `export default memo(foo);`,
      result: false,
    },
    // export default [function / class] ...
    {
      code: `export default function Foo() {};`,
      result: true,
    },
    {
      code: `export default class Foo {}`,
      result: false,
    },
    {
      code: `export default function foo() {};`,
      result: false,
    },
    {
      code: `export default class foo {}`,
      result: false,
    },
    // export 
    {
      code: `export { Foo }`,
      result: true,
    },
    {
      code: `export { foo }`,
      result: false,
    },
    {
      code: `export { Foo, baz }`,
      result: false,
    },
    
    // export 
    {
      code: `export * as Foo from './foo.js'`,
      result: false,
    },
    {
      code: `export { Foo } from './foo.js'`,
      result: true,
    },
    {
      code: `export { Foo as foo } from './foo.js'`,
      result: false,
    },
    {
      code: `export { foo as Foo } from './foo.js'`,
      result: true,
    },
    {
      code: `export { foo } from './foo.js'`,
      result: false,
    },
    {
      code: `export { Foo, baz } from './foo.js'`,
      result: false,
    },
    {
      code: `export { Foo as default }`,
      result: true,
    },
    {
      code: `export { foo as default }`,
      result: false,
    },
    {
      code: `export { default as Foo }`,
      result: true,
    },
    {
      code: `export { default as foo }`,
      result: false,
    },
    {
      code: `export function Foo() {}`,
      result: true,
    },
    {
      code: `export function foo() {}`,
      result: false,
    },
    {
      code: `export class Foo {}`,
      result: false,
    },
    {
      code: `export class foo {}`,
      result: false,
    },
  ]

  cases.forEach((aCase) => {
    test(`${aCase.code.slice(0, 30)} should be ${aCase.result}`, () => {
      const c = new ReactRefreshBoundaryCollector();
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
      expect(c.isReactRefreshBoundary).toBe(aCase.result)
    })
  })
})
