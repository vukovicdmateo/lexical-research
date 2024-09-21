import type { DOMExportOutput } from './LexicalNode';

import { createEmptyEditorState } from './LexicalEditorState';
import { internalGetActiveEditor } from './LexicalUpdates';
import { LexicalNode } from './LexicalNode';

// https://github.com/microsoft/TypeScript/issues/3841
type GenericConstructor<T> = new (...args: any[]) => T;
// Allow us to look up the type including static props
export type KlassConstructor<Cls extends GenericConstructor<any>> =
  GenericConstructor<InstanceType<Cls>> & { [k in keyof Cls]: Cls[k] };

export type Klass<T extends LexicalNode> = InstanceType<
  T['constructor']
> extends T
  ? T['constructor']
  : GenericConstructor<T> & T['constructor'];

export type EditorThemeClassName = string;

export type EditorThemeClasses = {
  heading?: {
    h1?: EditorThemeClassName;
    h2?: EditorThemeClassName;
    h3?: EditorThemeClassName;
    h4?: EditorThemeClassName;
    h5?: EditorThemeClassName;
    h6?: EditorThemeClassName;
  };
};

export type CreateEditorArgs = {
  disableEvents?: boolean;
  parentEditor?: LexicalEditor;
  theme?: EditorThemeClasses;
};

export type Transform<T extends LexicalNode> = (node: T) => void;

export type RegisteredNode = {
  klass: Klass<LexicalNode>;
  transforms: Set<Transform<LexicalNode>>;
  replace: null | ((node: LexicalNode) => LexicalNode);
  replaceWithKlass: null | Klass<LexicalNode>;
  exportDOM?: (
    editor: LexicalEditor,
    targetNode: LexicalNode
  ) => DOMExportOutput;
};

export type RegisteredNodes = Map<string, RegisteredNode>;

export function createEditor(editorConfig?: CreateEditorArgs) {
  const config = editorConfig || {};
  const activeEditor = internalGetActiveEditor();
  const theme = config.theme || {};
  const parentEditor =
    editorConfig === undefined ? activeEditor : config.parentEditor || null;
  const disableEvents = config.disableEvents || false;
  const editorState = createEmptyEditorState();
}

export class LexicalEditor {
  _nodes: RegisteredNodes;
}
