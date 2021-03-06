import * as ts from "typescript";
import { LuaTarget } from "../../CompilerOptions";
import { createSerialDiagnosticFactory } from "../../utils";
import { AnnotationKind } from "./annotations";

type MessageProvider<TArgs extends any[]> = string | ((...args: TArgs) => string);

const createDiagnosticFactory = <TArgs extends any[]>(
    category: ts.DiagnosticCategory,
    message: MessageProvider<TArgs>
) =>
    createSerialDiagnosticFactory((node: ts.Node, ...args: TArgs) => ({
        file: node.getSourceFile(),
        start: node.getStart(),
        length: node.getWidth(),
        messageText: typeof message === "string" ? message : message(...args),
        category,
    }));

const createErrorDiagnosticFactory = <TArgs extends any[]>(message: MessageProvider<TArgs>) =>
    createDiagnosticFactory(ts.DiagnosticCategory.Error, message);
const createWarningDiagnosticFactory = <TArgs extends any[]>(message: MessageProvider<TArgs>) =>
    createDiagnosticFactory(ts.DiagnosticCategory.Warning, message);

export const unsupportedNodeKind = createErrorDiagnosticFactory(
    (kind: ts.SyntaxKind) => `Unsupported node kind ${ts.SyntaxKind[kind]}`
);

export const forbiddenForIn = createErrorDiagnosticFactory("Iterating over arrays with 'for ... in' is not allowed.");

export const unsupportedNoSelfFunctionConversion = createErrorDiagnosticFactory((name?: string) => {
    const nameReference = name ? ` '${name}'` : "";
    return (
        `Unable to convert function with a 'this' parameter to function${nameReference} with no 'this'. ` +
        "To fix, wrap in an arrow function, or declare with 'this: void'."
    );
});

export const unsupportedSelfFunctionConversion = createErrorDiagnosticFactory((name?: string) => {
    const nameReference = name ? ` '${name}'` : "";
    return (
        `Unable to convert function with no 'this' parameter to function${nameReference} with 'this'. ` +
        "To fix, wrap in an arrow function, or declare with 'this: any'."
    );
});

export const unsupportedOverloadAssignment = createErrorDiagnosticFactory((name?: string) => {
    const nameReference = name ? ` to '${name}'` : "";
    return (
        `Unsupported assignment of function with different overloaded types for 'this'${nameReference}. ` +
        "Overloads should all have the same type for 'this'."
    );
});

export const decoratorInvalidContext = createErrorDiagnosticFactory("Decorator function cannot have 'this: void'.");

export const annotationInvalidArgumentCount = createErrorDiagnosticFactory(
    (kind: AnnotationKind, got: number, expected: number) => `'@${kind}' expects ${expected} arguments, but got ${got}.`
);

export const extensionCannotConstruct = createErrorDiagnosticFactory(
    "Cannot construct classes with '@extension' or '@metaExtension' annotation."
);

export const extensionCannotExtend = createErrorDiagnosticFactory(
    "Cannot extend classes with '@extension' or '@metaExtension' annotation."
);

export const extensionCannotExport = createErrorDiagnosticFactory(
    "Cannot export classes with '@extension' or '@metaExtension' annotation."
);

export const extensionInvalidInstanceOf = createErrorDiagnosticFactory(
    "Cannot use instanceof on classes with '@extension' or '@metaExtension' annotation."
);

export const extensionAndMetaExtensionConflict = createErrorDiagnosticFactory(
    "Cannot use both '@extension' and '@metaExtension' annotations on the same class."
);

export const metaExtensionMissingExtends = createErrorDiagnosticFactory(
    "'@metaExtension' annotation requires the extension of the metatable class."
);

export const invalidForRangeCall = createErrorDiagnosticFactory(
    (message: string) => `Invalid @forRange call: ${message}.`
);

export const luaTableMustBeAmbient = createErrorDiagnosticFactory(
    "Classes with the '@luaTable' annotation must be ambient."
);

export const luaTableCannotBeExtended = createErrorDiagnosticFactory(
    "Cannot extend classes with the '@luaTable' annotation."
);

export const luaTableInvalidInstanceOf = createErrorDiagnosticFactory(
    "The instanceof operator cannot be used with a '@luaTable' class."
);

export const luaTableCannotBeAccessedDynamically = createErrorDiagnosticFactory(
    "@luaTable cannot be accessed dynamically."
);

export const luaTableForbiddenUsage = createErrorDiagnosticFactory(
    (description: string) => `Invalid @luaTable usage: ${description}.`
);

export const luaIteratorForbiddenUsage = createErrorDiagnosticFactory(
    "Unsupported use of lua iterator with '@tupleReturn' annotation in for...of statement. " +
        "You must use a destructuring statement to catch results from a lua iterator with " +
        "the '@tupleReturn' annotation."
);

export const unsupportedAccessorInObjectLiteral = createErrorDiagnosticFactory(
    "Accessors in object literal are not supported."
);

export const unsupportedRightShiftOperator = createErrorDiagnosticFactory(
    "Right shift operator is not supported for target Lua 5.3. Use `>>>` instead."
);

const getLuaTargetName = (version: LuaTarget) => (version === LuaTarget.LuaJIT ? "LuaJIT" : `Lua ${version}`);
export const unsupportedForTarget = createErrorDiagnosticFactory(
    (functionality: string, version: Exclude<LuaTarget, LuaTarget.Universal>) =>
        `${functionality} is/are not supported for target ${getLuaTargetName(version)}.`
);

export const unsupportedProperty = createErrorDiagnosticFactory(
    (parentName: string, property: string) => `${parentName}.${property} is unsupported.`
);

export const invalidAmbientIdentifierName = createErrorDiagnosticFactory(
    (text: string) => `Invalid ambient identifier name '${text}'. Ambient identifiers must be valid lua identifiers.`
);

export const unresolvableRequirePath = createErrorDiagnosticFactory(
    (path: string) => `Cannot create require path. Module '${path}' does not exist within --rootDir.`
);

export const unsupportedVarDeclaration = createErrorDiagnosticFactory(
    "`var` declarations are not supported. Use `let` or `const` instead."
);

export const annotationDeprecated = createWarningDiagnosticFactory(
    (kind: AnnotationKind) =>
        `'@${kind}' is deprecated and will be removed in a future update. Please update your code before upgrading to the next release, otherwise your project will no longer compile. ` +
        `See https://typescripttolua.github.io/docs/advanced/compiler-annotations#${kind.toLowerCase()} for more information.`
);
