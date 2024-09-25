import invariant from 'shared/invariant';
import type { Klass, KlassConstructor } from 'lexical';
import { errorOnReadOnly, getActiveEditor } from './LexicalUpdates';
import { $getNodeByKey, $setNodeKey } from './LexicalUtils';
import { $getSelection, BaseSelection } from './LexicalSelection';
import { $isTextNode } from './nodes/LexicalTextNode';
import { $isElementNode, ElementNode } from './nodes/LexicalElementNode';

type NodeName = string;

export type DOMChildConversion = (
  lexicalNode: LexicalNode,
  parentLexicalNode: LexicalNode | null | undefined
) => LexicalNode | null | undefined;

export type DOMConversionOutput = {
  after?: (childLexicalNodes: Array<LexicalNode>) => Array<LexicalNode>;
  forChild?: DOMChildConversion;
  node: null | LexicalNode | Array<LexicalNode>;
};

export type DOMConversionFn<T extends HTMLElement = HTMLElement> = (
  element: T
) => DOMConversionOutput | null;

export type DOMConversion<T extends HTMLElement = HTMLElement> = {
  conversion: DOMConversionFn<T>;
  priority?: 0 | 1 | 2 | 3 | 4;
};

export type DOMConversionMap<T extends HTMLElement = HTMLElement> = Record<
  NodeName,
  (node: T) => DOMConversion<T> | null
>;

export type DOMExportOutput = {
  after?: (
    generatedElement: HTMLElement | DocumentFragment | Text | null | undefined
  ) => HTMLElement | Text | null | undefined;
  element: HTMLElement | DocumentFragment | Text | null;
};

export type NodeKey = string;

export class LexicalNode {
  ['constructor']!: KlassConstructor<typeof LexicalNode>;
  __type: string;
  __key: string;
  __parent: null | NodeKey;
  __prev: null | NodeKey;
  __next: null | NodeKey;

  static getType(): string {
    invariant(
      false,
      'LexicalNode: Node %s does not implement .getType().',
      this.name
    );
  }

  static clone(_data: unknown): LexicalNode {
    invariant(
      false,
      'LexicalNode: Node %s does not implement .clone().',
      this.name
    );
  }

  afterCloneFrom(prevNode: this) {
    this.__parent = prevNode.__parent;
    this.__next = prevNode.__next;
    this.__prev = prevNode.__prev;
  }

  static importDOM?: () => DOMConversionMap<any> | null;

  constructor(key?: NodeKey) {
    this.__type = this.constructor.getType();
    this.__parent = null;
    this.__prev = null;
    this.__next = null;
    $setNodeKey(this, key);

    if (__DEV__) {
      if (this.__type !== 'root') {
        errorOnReadOnly();
        errorOnTypeKlassMismatch(this.__type, this.constructor);
      }
    }
  }

  // Getters and Traversers

  getType(): string {
    return this.__type;
  }

  isInline(): boolean {
    invariant(
      false,
      'LexicalNode: Node %s does not implement .isInline().',
      this.constructor.name
    );
  }

  /**
   * Returns true if there is a path between this node and the RootNode, false otherwise.
   * This is a way of determining if the node is "attached" EditorState. Unattached nodes
   * won't be reconciled and will ultimatelt be cleaned up by the Lexical GC.
   */
  isAttached(): boolean {
    let nodeKey: string | null = this.__key;
    while (nodeKey !== null) {
      if (nodeKey === 'root') {
        return true;
      }

      const node: LexicalNode | null = $getNodeByKey(nodeKey);

      if (node === null) {
        break;
      }
      nodeKey = node.__parent;
    }
    return false;
  }

  isSelected(selection?: null | BaseSelection): boolean {
    const targetSelection = selection || $getSelection();

    if (targetSelection == null) {
      return false;
    }

    const isSelected = targetSelection
      .getNodes()
      .some((n) => n.__key === this.__key);

    if ($isTextNode(this)) {
      return isSelected;
    }

    // TODO: (2) Continue here
    return false;
  }

  getKey(): NodeKey {
    // Key is stable between copies
    return this.__key;
  }

  getIndexWithinParent(): number {
    const parent = this.getParent();
    if (parent === null) {
      return -1;
    }
    let node = parent.getFirstChild();
    let index = 0;
    while (node !== null) {
      if (this.is(node)) {
        return index;
      }
      index++;
      node = node.getNextSibling();
    }
    return -1;
  }

  is(object: LexicalNode | null | undefined): boolean {
    if (object == null) {
      return false;
    }
    return this.__key === object.__key;
  }

  isBefore(targetNode: LexicalNode): boolean {
    if (this === targetNode) {
      return false;
    }

    if (targetNode.isParentOf(this)) {
      return true;
    }

    if (this.isParentOf(targetNode)) {
      return false;
    }

    const commonAncestor = this.getCommonAncestor(targetNode);
    let indexA = 0;
    let indexB = 0;
    let node: this | ElementNode | LexicalNode = this;
    while (true) {
      const parent: ElementNode = node.getParentOrThrow();
      if (parent === commonAncestor) {
        indexA = node.getIndexWithinParent();
        break;
      }
      node = parent;
    }
    node = targetNode;
    while (true) {
      const parent: ElementNode = node.getParentOrThrow();
      if (parent === commonAncestor) {
        indexB = node.getIndexWithinParent();
        break;
      }
      node = parent;
    }
    return indexA < indexB;
  }

  getCommonAncestor<T extends ElementNode = ElementNode>(
    node: LexicalNode
  ): T | null {
    const a = this.getParents();
    const b = node.getParents();
    if ($isElementNode(this)) {
      a.unshift(this);
    }
    if ($isElementNode(node)) {
      b.unshift(node);
    }
    const aLength = a.length;
    const bLength = b.length;
    if (aLength === 0 || bLength === 0 || a[aLength - 1] !== b[bLength - 1]) {
      return null;
    }
    const bSet = new Set(b);
    for (let i = 0; i < aLength; i++) {
      const ancestor = a[i] as T;
      if (bSet.has(ancestor)) {
        return ancestor;
      }
    }
    return null;
  }

  isParentOf(targetNode: LexicalNode): boolean {
    const key = this.__key;
    if (key === targetNode.__key) {
      return false;
    }
    let node: ElementNode | LexicalNode | null = targetNode;
    while (node !== null) {
      if (node.__key === key) {
        return true;
      }
      node = node.getParent();
    }
    return false;
  }

  getParent<T extends ElementNode>(): T | null {
    const parent = this.getLatest().__parent;
    if (parent === null) {
      return null;
    }
    return $getNodeByKey<T>(parent);
  }

  getParentOrThrow<T extends ElementNode>(): T {
    const parent = this.getParent<T>();
    if (parent === null) {
      invariant(false, 'Expected node %s to have a parent.', this.__key);
    }
    return parent;
  }

  getParents(): Array<ElementNode> {
    const parents: Array<ElementNode> = [];
    let node = this.getParent();
    while (node !== null) {
      parents.push(node);
      node = node.getParent();
    }
    return parents;
  }

  getNodesBetween(targetNode: LexicalNode): Array<LexicalNode> {
    const isBefore = this.isBefore(targetNode);
    const nodes = [];
    const visited = new Set();
    let node: LexicalNode | this | null = this;
    while (true) {
      if (node === null) {
        break;
      }
      const key = node.__key;
      if (!visited.has(key)) {
        visited.add(key);
        nodes.push(node);
      }
      if (node === targetNode) {
        break;
      }
      const child: LexicalNode | null = $isElementNode(node)
        ? isBefore
          ? node.getFirstChild()
          : node.getLastChild()
        : null;
      if (child !== null) {
        node = child;
        continue;
      }
      const nextSibling: LexicalNode | null = isBefore
        ? node.getNextSibling()
        : node.getPreviousSibling();
      if (nextSibling !== null) {
        node = nextSibling;
        continue;
      }
      const parent: LexicalNode | null = node.getParentOrThrow();
      if (!visited.has(parent.__key)) {
        nodes.push(parent);
      }
      if (parent === targetNode) {
        break;
      }
      let parentSibling = null;
      let ancestor: LexicalNode | null = parent;
      do {
        if (ancestor === null) {
          invariant(false, 'getNodesBetween: ancestor is null');
        }
        parentSibling = isBefore
          ? ancestor.getNextSibling()
          : ancestor.getPreviousSibling();
        ancestor = ancestor.getParent();
        if (ancestor !== null) {
          if (parentSibling === null && !visited.has(ancestor.__key)) {
            nodes.push(ancestor);
          }
        } else {
          break;
        }
      } while (parentSibling === null);
      node = parentSibling;
    }
    if (!isBefore) {
      nodes.reverse();
    }
    return nodes;
  }

  getLatest(): this {
    const latest = $getNodeByKey<this>(this.__key);
    if (latest === null) {
      invariant(
        false,
        'Lexical node does not exist in active editor state. Avoid using the same node references between nested closures from editorState.read/editor.update.'
      );
    }
    return latest;
  }

  getPreviousSibling<T extends LexicalNode>(): T | null {
    const self = this.getLatest();
    const prevKey = self.__prev;
    return prevKey === null ? null : $getNodeByKey<T>(prevKey);
  }

  getNextSibling<T extends LexicalNode>(): T | null {
    const self = this.getLatest();
    const nextKey = self.__next;
    return nextKey === null ? null : $getNodeByKey<T>(nextKey);
  }
}

export type NodeMap = Map<NodeKey, LexicalNode>;

function errorOnTypeKlassMismatch(
  type: string,
  klass: Klass<LexicalNode>
): void {
  const registeredNode = getActiveEditor()._nodes.get(type);
  // Common error - split in its own invariant
  if (registeredNode === undefined) {
    invariant(
      false,
      'Create node: Attempted to create node %s that was not configured to be used on the editor.',
      klass.name
    );
  }
  const editorKlass = registeredNode.klass;
  if (editorKlass !== klass) {
    invariant(
      false,
      'Create node: Type %s in node %s does not match registered node %s with the same type',
      type,
      klass.name,
      editorKlass.name
    );
  }
}
