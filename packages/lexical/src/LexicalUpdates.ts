import invariant from 'shared/invariant';

import { LexicalEditor } from './LexicalEditor';
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

export function getActiveEditorState(): EditorState {
  if (activeEditorState === null) {
    invariant(
      false,
      'Unable to find an active editor state. ' +
        'State helpers or node methods can only be used ' +
        'synchronously during the callback of ' +
        'editor.update(), editor.read(), or editorState.read().%s'
      // TODO: (1) collectBuildInformation()
    );
  }

  return activeEditorState;
}

export function getActiveEditor(): LexicalEditor {
  if (activeEditor === null) {
    invariant(
      false,
      'Unable to find an active editor. ' +
        'This method can only be used ' +
        'synchronously during the callback of ' +
        'editor.update() or editor.read().%s'
      // TODO: (1) collectBuildInformation()
    );
  }
  return activeEditor;
}

export function internalGetActiveEditor(): LexicalEditor | null {
  return activeEditor;
}

export function internalGetActiveEditorState(): EditorState | null {
  return activeEditorState;
}
