import {
  CallExpression,
  ExportDefaultExpression,
  ModuleDeclaration,
} from '@swc/core'
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
      // We don't care about these nodes
    } else if (type === 'ExportAllDeclaration') {
      // export * from './foo'
      this.areAllExportsComponents = false
    } else if (type === 'ExportDefaultExpression') {
      const { expression: exp } = moduleDecl
      if (exp.type === 'Identifier') {
        // export default Foo
        this.areAllExportsComponents = isComponentLikeName(exp.value)
      } else if (exp.type === 'CallExpression') {
        // export default memo(Component)
        this.areAllExportsComponents = getIsFnCallOfMemoWithComponent(exp)
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
      } else if (type === 'ClassDeclaration') {
        this.areAllExportsComponents = false
      } else if (type === 'FunctionDeclaration') {
        this.areAllExportsComponents = isComponentLikeName(
          declaration.identifier.value,
        )
      } else if (type === 'VariableDeclaration') {
        this.areAllExportsComponents = declaration.declarations
          .flatMap((declarator) =>
            declarator.id.type === 'Identifier' ? [declarator.id.value] : [],
          )
          .every((name) => isComponentLikeName(name))
      } else {
        neverCheck(type)
      }
    } else if (type === 'ExportDefaultDeclaration') {
      // export default function Foo() {}
      // export default class Foo {}
      const { decl } = moduleDecl
      if (
        decl.type === 'FunctionExpression'
      ) {
        this.areAllExportsComponents = isComponentLikeName(
          decl.identifier.value,
        )
      } else if (decl.type === 'ClassExpression') {
        this.areAllExportsComponents = false
      }
    } else if (type === 'ExportNamedDeclaration') {
      for (const s of moduleDecl.specifiers) {
        let exportName: string
        if (s.type === 'ExportNamespaceSpecifier') {
          this.areAllExportsComponents = false
          break
        } else if (s.type == 'ExportDefaultSpecifier') {
          exportName = s.exported.value
        } else {
          exportName = s.exported?.value ?? s.orig.value
          if (exportName === 'default') {
            exportName = s.orig.value
          }
        }
        this.areAllExportsComponents = isComponentLikeName(exportName)
      }
    } else {
      neverCheck(type)
    }
    return moduleDecl
  }
}

const getIsFnCallOfMemoWithComponent = (exp: CallExpression) => {
  const isMemoFn =
    exp.callee.type === 'Identifier' && exp.callee.value === 'memo'

  const isPassComponentLike =
    exp.arguments[0] &&
    exp.arguments[0].expression.type === 'Identifier' &&
    isComponentLikeName(exp.arguments[0].expression.value)
  return isMemoFn && isPassComponentLike
}
