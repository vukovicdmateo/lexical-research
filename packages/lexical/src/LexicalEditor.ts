import type { NodeKey } from './LexicalNode';
import { createEmptyEditorState } from './LexicalEditorState';
import { LexicalNode } from './LexicalNode';
import { internalGetActiveEditor } from './LexicalUpdates';

// https://github.com/microsoft/TypeScript/issues/3841
/*
KlassConstructor<Cls> is a type that combines a constructor function that
produces instances of the type created by Cls and all the static members
of Cls. 
*/
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type KlassConstructor<Cls extends GenericConstructor<any>> =
  GenericConstructor<InstanceType<Cls>> & { [k in keyof Cls]: Cls[k] };
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type GenericConstructor<T> = new (...args: any[]) => T;

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
  hr?: EditorThemeClassName;
};

export type CreateEditorArgs = {
  disableEvents?: boolean;
  parentEditor?: LexicalEditor;
  theme?: EditorThemeClasses;
};

export type RegisteredNodes = Map<string, RegisteredNode>;

export type RegisteredNode = {
  klass: Klass<LexicalNode>;
  // TODO: contunue here
};

type IntentionallyMarkedAsDirtyElement = boolean;

export function createEditor(editorConfig?: CreateEditorArgs): LexicalEditor {
  const config = editorConfig || {};
  const activeEditor = internalGetActiveEditor();
  const theme = config.theme || {};
  const parentEditor =
    editorConfig === undefined ? activeEditor : config.parentEditor || null;
  const disableEvents = config.disableEvents || false;
  const editorState = createEmptyEditorState();

  const editor = new LexicalEditor();

  return editor;
}

export class LexicalEditor {
  ['constructor']!: KlassConstructor<typeof LexicalEditor>;

  /** @internal */
  _nodes: RegisteredNodes;
  /** @internal */
  _dirtyType: 0 | 1 | 2;
  /** @internal */
  _cloneNotNeeded: Set<NodeKey>;
  /** @internal */
  _dirtyLeaves: Set<NodeKey>;
  /** @internal */
  _dirtyElements: Map<NodeKey, IntentionallyMarkedAsDirtyElement>;
}
