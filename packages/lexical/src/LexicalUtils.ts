import invariant from 'shared/invariant';
import type { LexicalNode, NodeKey } from './LexicalNode';
import {
  internalGetActiveEditorState,
  errorOnReadOnly,
  errorOnInfiniteTransforms,
  getActiveEditor,
  getActiveEditorState,
} from './LexicalUpdates';
import { HAS_DIRTY_NODES } from './LexicalConstants';
import { $isElementNode } from './nodes/LexicalElementNode';

let keyCounter = 1;

export function resetRandomKey(): void {
  keyCounter = 1;
}

export function generateRandomKey(): string {
  return '' + keyCounter++;
}

export function $setNodeKey(
  node: LexicalNode,
  existingKey: NodeKey | null | undefined
): void {
  if (existingKey != null) {
    if (__DEV__) {
      errorOnNodeKeyConstructorMismatch(node, existingKey);
    }
    node.__key = existingKey;
    return;
  }
  errorOnReadOnly();
  errorOnInfiniteTransforms();
  const editor = getActiveEditor();
  const editorState = getActiveEditorState();
  const key = generateRandomKey();
  editorState._nodeMap.set(key, node);
  if ($isElementNode(node)) {
    editor._dirtyElements.set(key, true);
  } else {
    editor._dirtyLeaves.add(key);
  }
  editor._cloneNotNeeded.add(key);
  editor._dirtyType = HAS_DIRTY_NODES;
  node.__key = key;
}

function errorOnNodeKeyConstructorMismatch(
  node: LexicalNode,
  existingKey: NodeKey
) {
  const editorState = internalGetActiveEditorState();
  if (!editorState) {
    // tests expect to be able to do this kind of clone without an active editor state
    return;
  }
  const existingNode = editorState._nodeMap.get(existingKey);
  if (existingNode && existingNode.constructor !== node.constructor) {
    // Lifted condition to if statement because the inverted logic is a bit confusing
    if (node.constructor.name !== existingNode.constructor.name) {
      invariant(
        false,
        'Lexical node with constructor %s attempted to re-use key from node in active editor state with constructor %s. Keys must not be re-used when the type is changed.',
        node.constructor.name,
        existingNode.constructor.name
      );
    } else {
      invariant(
        false,
        'Lexical node with constructor %s attempted to re-use key from node in active editor state with different constructor with the same name (possibly due to invalid Hot Module Replacement). Keys must not be re-used when the type is changed.',
        node.constructor.name
      );
    }
  }
}
