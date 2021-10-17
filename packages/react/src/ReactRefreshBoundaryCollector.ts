import { ModuleDeclaration } from '@swc/core'
import Visitor from '@swc/core/Visitor'

function isComponentLikeName(name: string): boolean {
  return typeof name === 'string' && name[0] >= 'A' && name[0] <= 'Z'
}

function neverCheck(foo: never): never {
  throw new Error(`expected never got ${foo}`)
}

export default class ReactRefreshBoundaryCollector extends Visitor {
  hasExports = false

  _areAllExportsComponents = true
  get areAllExportsComponents() {
    return this._areAllExportsComponents
  }
  set areAllExportsComponents(val) {
    this.hasExports = true
    this._areAllExportsComponents = val
  }

  get isReactRefreshBoundary() {
    return this.hasExports && this.areAllExportsComponents
  }

  // patched from https://github.com/facebook/react/blob/a817840ea7d3818c0590cccb9159b13220f4fdb4/packages/react-refresh/src/ReactFreshBabelPlugin.js#L437-L438
  visitModuleDeclaration(moduleDecl: ModuleDeclaration): ModuleDeclaration {
    if (!this.areAllExportsComponents) return moduleDecl
    const { type } = moduleDecl
    if (
      type === 'ImportDeclaration' ||
      type === 'TsExportAssignment' ||
      type === 'TsImportEqualsDeclaration' ||
      type === 'TsNamespaceExportDeclaration'
    ) {
      // we don't care about these types
    } else if (type === 'ExportAllDeclaration') {
      // export * from './foo'
      this.areAllExportsComponents = false
    } else if (type === 'ExportDefaultExpression') {
      const { expression } = moduleDecl
      const { type } = expression
      if (type === 'Identifier') {
        // export default Foo
        this.areAllExportsComponents = isComponentLikeName(expression.value)
      } else if (type === 'CallExpression') {
        // export default memo(Component)
        this.areAllExportsComponents =
          expression.callee.type === 'Identifier' &&
          expression.callee.value === 'memo'
      } else {
        this.areAllExportsComponents = false
      }
    } else if (type === 'ExportDeclaration') {
      // export function Foo() {}
      // export const Foo = () => {}
      // export var a = 1;
      const { declaration } = moduleDecl
      const { type } = declaration
      if (
        type === 'TsEnumDeclaration' ||
        type === 'TsInterfaceDeclaration' ||
        type === 'TsModuleDeclaration' ||
        type === 'TsTypeAliasDeclaration'
      ) {
        // noop
      } else if (
        type === 'FunctionDeclaration' ||
        type === 'ClassDeclaration'
      ) {
        this.areAllExportsComponents = isComponentLikeName(
          declaration.identifier.value,
        )
      } else if (type === 'VariableDeclaration') {
        this.areAllExportsComponents = declaration.declarations
          .flatMap((decl) =>
            decl.id.type === 'Identifier' ? [decl.id.value] : [],
          )
          .every((name) => isComponentLikeName(name))
      } else {
        neverCheck(type)
      }
    } else if (type === 'ExportDefaultDeclaration') {
      const { decl } = moduleDecl
      const { type } = decl
      if (type === 'TsInterfaceDeclaration') {
        // noop
      } else if (
        type === 'FunctionExpression' ||
        type === 'ClassExpression'
      ) {
        this.areAllExportsComponents = isComponentLikeName(
          decl.identifier.value,
        )
      } else {
        neverCheck(type)
      }
    } else if (type === 'ExportNamedDeclaration') {
      this.areAllExportsComponents = moduleDecl.specifiers
        .map((s) => {
          switch (s.type) {
            case 'ExportNamespaceSpecifier': {
              return s.name.value
            }
            case 'ExportDefaultSpecifier': {
              return s.exported.value
            }
            case 'ExportSpecifier': {
              return s.orig.value
            }
          }
        })
        .every((name) => isComponentLikeName(name))
    } else {
      neverCheck(type)
    }
    return moduleDecl
  }
}
