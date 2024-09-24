import { LexicalNode, NodeKey } from '../LexicalNode';
import { $getNodeByKey } from '../LexicalUtils';

export class ElementNode extends LexicalNode {
  __first: null | NodeKey;
  __last: null | NodeKey;
  __size: number;

  getChildrenSize(): number {
    const self = this.getLatest();
    return self.__size;
  }

  getFirstChild<T extends LexicalNode>(): null | T {
    const self = this.getLatest();
    const firstKey = self.__first;
    return firstKey === null ? null : $getNodeByKey<T>(firstKey);
  }

  getFirstDescendant<T extends LexicalNode>(): null | T {
    let node = this.getFirstChild<T>();
    while ($isElementNode(node)) {
      const child = node.getFirstChild<T>();
      if (child === null) {
        break;
      }
      node = child;
    }
    return node;
  }

  getLastChild<T extends LexicalNode>(): null | T {
    const self = this.getLatest();
    const lastKey = self.__last;
    return lastKey === null ? null : $getNodeByKey<T>(lastKey);
  }

  getChildren<T extends LexicalNode>(): Array<T> {
    const children: Array<T> = [];
    let child: T | null = this.getFirstChild();
    while (child !== null) {
      children.push(child);
      child = child.getNextSibling();
    }
    return children;
  }

  getLastDescendant<T extends LexicalNode>(): null | T {
    let node = this.getLastChild<T>();
    while ($isElementNode(node)) {
      const child = node.getLastChild<T>();
      if (child === null) {
        break;
      }
      node = child;
    }
    return node;
  }

  getDescendantByIndex<T extends LexicalNode>(index: number): null | T {
    const children = this.getChildren<T>();
    const childrenLength = children.length;
    // For non-empty element nodes, we resolve its descendant
    // (either a leaf node or the bottom-most element)
    if (index >= childrenLength) {
      const resolvedNode = children[childrenLength - 1];
      return (
        ($isElementNode(resolvedNode) && resolvedNode.getLastDescendant()) ||
        resolvedNode ||
        null
      );
    }
    const resolvedNode = children[index];
    return (
      ($isElementNode(resolvedNode) && resolvedNode.getFirstDescendant()) ||
      resolvedNode ||
      null
    );
  }

  getChildAtIndex<T extends LexicalNode>(index: number): null | T {
    const size = this.getChildrenSize();
    let node: null | T;
    let i;
    if (index < size / 2) {
      node = this.getFirstChild<T>();
      i = 0;
      while (node !== null && i <= index) {
        if (i === index) {
          return node;
        }
        node = node.getNextSibling();
        i++;
      }
      return null;
    }
    node = this.getLastChild<T>();
    i = size - 1;
    while (node !== null && i >= index) {
      if (i === index) {
        return node;
      }
      node = node.getPreviousSibling();
      i--;
    }
    return null;
  }
}

export function $isElementNode(
  node: LexicalNode | null | undefined
): node is ElementNode {
  return node instanceof ElementNode;
}
