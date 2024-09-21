import invariant from 'shared/invariant';

import { LexicalEditor } from './LexicalEditor';

let activeEditor: null | LexicalEditor = null;
let isReadOnlyMode = false;

export function errorOnReadOnly(): void {
  if (isReadOnlyMode) {
    invariant(false, 'Cannot use method in read-only mode.');
  }
}

export function getActiveEditor(): LexicalEditor {
  if (activeEditor === null) {
    invariant(
      false,
      'Unable to find an active editor. ' +
        'This method can only be used ' +
        'synchronously during the callback of ' +
        'editor.update() or editor.read().%s'
      // TODO: (2) collectBuildInformation()
    );
  }
  return activeEditor;
}

export function internalGetActiveEditor(): LexicalEditor | null {
  return activeEditor;
}
