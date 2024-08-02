import type { LexicalEditor } from './LexicalEditor';

import invariant from 'shared/invariant';

import { EditorState } from './LexicalEditorState';

let activeEditorState: null | EditorState = null;
let activeEditor: null | LexicalEditor = null;
let isReadOnlyMode = false;
let infiniteTransformCount = 0;

export function errorOnReadOnly(): void {
  if (isReadOnlyMode) {
    invariant(false, 'Cannot use method in read-only mode.');
  }
}

export function errorOnInfiniteTransforms(): void {
  if (infiniteTransformCount > 99) {
    invariant(
      false,
      'One or more transforms are endlessly triggering additional transforms. May have encountered infinite recursion caused by transforms that have their preconditions too lose and/or conflict with each other.'
    );
  }
}

export function internalGetActiveEditor(): LexicalEditor | null {
  return activeEditor;
}

export function internalGetActiveEditorState(): EditorState | null {
  return activeEditorState;
}
