import type { NodeMap } from './LexicalNode';

export function createEmptyEditorState(): EditorState {
  // TODO: (2) Continue here
  return new EditorState();
}

export class EditorState {
  _nodeMap: NodeMap;
}
