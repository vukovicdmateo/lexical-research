import { LexicalNode } from '../LexicalNode';

export class TextNode extends LexicalNode {}

export function $isTextNode(
  node: LexicalNode | null | undefined
): node is TextNode {
  return node instanceof TextNode;
}
