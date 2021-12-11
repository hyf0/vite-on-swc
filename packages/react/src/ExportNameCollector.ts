import {
  CallExpression,
  ExportDeclaration,
  ExportDefaultDeclaration,
  ExportDefaultExpression,
  ExportNamedDeclaration,
  ModuleDeclaration,
  TsType,
} from '@swc/core'
import Visitor from '@swc/core/Visitor'

function isComponentLikeName(name: string): boolean {
  return typeof name === 'string' && name[0] >= 'A' && name[0] <= 'Z'
}

function neverCheck(foo: never): never {
  throw new Error(`expected never got ${foo}`)
}

export default class ExportNameCollector extends Visitor {
  exportedNames = new Set<string>()
  isAbsolutelyNotReactRefreshBoundary = false

  visitTsType(n: TsType): TsType {
    return n
  }

  addName(name: string) {
    if (isComponentLikeName(name)) {
      this.exportedNames.add(name)
    } else {
      this.isAbsolutelyNotReactRefreshBoundary = true
    }
  }

  handleExportDefaultExpression(node: ExportDefaultExpression) {
    const { expression: exp } = node
    if (exp.type === 'Identifier') {
      // export default Foo
      this.addName(exp.value)
    } else if (exp.type === 'CallExpression') {
      // export default memo(Component)
      const isMemoFn =
        exp.callee.type === 'Identifier' && exp.callee.value === 'memo'

      const componentName =
        exp.arguments[0] && exp.arguments[0].expression.type === 'Identifier'
          ? exp.arguments[0].expression.value
          : null
      if (isMemoFn && componentName) {
        this.addName(componentName)
      } else {
        this.isAbsolutelyNotReactRefreshBoundary = true
      }
    } else {
      this.isAbsolutelyNotReactRefreshBoundary = true
    }
  }

  handleExportDeclaration(node: ExportDeclaration) {
    // export function Foo() {}
    // export const Foo = () => {}
    // export var a = 1;
    const { declaration } = node
    const { type } = declaration
    if (
      type === 'TsInterfaceDeclaration' ||
      type === 'TsModuleDeclaration' ||
      type === 'TsTypeAliasDeclaration'
    ) {
      // noop
    } else if (type === 'TsEnumDeclaration' || type === 'ClassDeclaration') {
      this.isAbsolutelyNotReactRefreshBoundary = true
    } else if (type === 'FunctionDeclaration') {
      this.addName(declaration.identifier.value)
    } else if (type === 'VariableDeclaration') {
      // TODO: all names
      declaration.declarations
        .flatMap((declarator) =>
          declarator.id.type === 'Identifier' ? [declarator.id.value] : [],
        )
        .forEach((name) => this.addName(name))
    } else {
      neverCheck(type)
    }
  }
  handleExportDefaultDeclaration(moduleDecl: ExportDefaultDeclaration) {
    // export default function Foo() {}
    // export default class Foo {}
    const { decl } = moduleDecl
    if (decl.type === 'FunctionExpression') {
      this.addName(decl.identifier.value)
    } else if (decl.type === 'ClassExpression') {
      this.isAbsolutelyNotReactRefreshBoundary = true
    }
  }
  handleExportNamedDeclaration(moduleDecl: ExportNamedDeclaration) {
    // TODO: should we consider re-exported components valid?
    for (const s of moduleDecl.specifiers) {
      let exportName: string
      if (s.type === 'ExportNamespaceSpecifier') {
        // export * as name from '...'
        this.isAbsolutelyNotReactRefreshBoundary = true
        break
      } else if (s.type == 'ExportDefaultSpecifier') {
        // export name from '...'
        exportName = s.exported.value
      } else {
        exportName = s.exported?.value ?? s.orig.value
        if (exportName === 'default') {
          exportName = s.orig.value
        }
      }
      this.addName(exportName)
    }
  }

  visitModuleDeclaration(moduleDecl: ModuleDeclaration): ModuleDeclaration {
    if (this.isAbsolutelyNotReactRefreshBoundary) {
      return moduleDecl
    }
    if (
      moduleDecl.type === 'ImportDeclaration' ||
      moduleDecl.type === 'TsExportAssignment' ||
      moduleDecl.type === 'TsImportEqualsDeclaration' ||
      moduleDecl.type === 'TsNamespaceExportDeclaration'
    ) {
      // We don't care about these nodes
    } else if (moduleDecl.type === 'ExportAllDeclaration') {
      // export * from './foo'
      this.isAbsolutelyNotReactRefreshBoundary = true
    } else if (moduleDecl.type === 'ExportDefaultExpression') {
      this.handleExportDefaultExpression(moduleDecl)
    } else if (moduleDecl.type === 'ExportDeclaration') {
      this.handleExportDeclaration(moduleDecl)
    } else if (moduleDecl.type === 'ExportDefaultDeclaration') {
      this.handleExportDefaultDeclaration(moduleDecl)
    } else if (moduleDecl.type === 'ExportNamedDeclaration') {
      this.handleExportNamedDeclaration(moduleDecl)
    }
    return moduleDecl
  }
}