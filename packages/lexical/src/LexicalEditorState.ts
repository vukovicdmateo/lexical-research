import type { NodeMap } from './LexicalNode';

export function createEmptyEditorState(): EditorState {
  // TODO: (3) Continue here
  return new EditorState();
}

export class EditorState {
  _nodeMap: NodeMap;
}
