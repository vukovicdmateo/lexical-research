import type { LexicalEditor } from './LexicalEditor';

import { EditorState } from './LexicalEditorState';

let activeEditorState: null | EditorState = null;
let activeEditor: null | LexicalEditor = null;

export function internalGetActiveEditor(): LexicalEditor | null {
  return activeEditor;
}

export function internalGetActiveEditorState(): EditorState | null {
  return activeEditorState;
}
