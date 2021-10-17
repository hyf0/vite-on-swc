import * as swc from '@swc/core'
import ReactRefreshBoundaryCollector from '../src/ReactRefreshBoundaryCollector'

describe('ReactRefreshBoundaryCollector', () => {
  test('export default Foo', () => {
    const c = new ReactRefreshBoundaryCollector()
    swc.transformSync(
      `
      const Foo = () => {};
      export default Foo;
    `,
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
    expect(c.isReactRefreshBoundary).toBe(true)
  })
})
