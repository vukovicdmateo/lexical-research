import type { NodeMap } from './LexicalNode';
import type { BaseSelection } from './LexicalSelection';

export function createEmptyEditorState(): EditorState {
  // TODO: (3) Continue here
  return new EditorState();
}

export class EditorState {
  _nodeMap: NodeMap;
  _selection: null | BaseSelection;
}
