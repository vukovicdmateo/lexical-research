import type { LexicalNode, NodeKey, NodeMap } from './LexicalNode';

export function $setNodeKey(
  node: LexicalNode,
  existingKey: NodeKey | null | undefined
): void {
  if (existingKey != null) {
    // TODO: continue here
    node.__key = existingKey;
    return;
  }
}
