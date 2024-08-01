import type { LexicalEditor } from './LexicalEditor';

import invariant from 'shared/invariant';

import { EditorState } from './LexicalEditorState';

let activeEditorState: null | EditorState = null;
let activeEditor: null | LexicalEditor = null;
let isReadOnlyMode = false;

export function errorOnReadOnly(): void {
  if (isReadOnlyMode) {
    invariant(false, 'Cannot use method in read-only mode.');
  }
}

export function internalGetActiveEditor(): LexicalEditor | null {
  return activeEditor;
}

export function internalGetActiveEditorState(): EditorState | null {
  return activeEditorState;
}
