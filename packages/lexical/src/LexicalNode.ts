import invariant from 'shared/invariant';
import type { Klass, KlassConstructor } from 'lexical';
import { errorOnReadOnly, getActiveEditor } from './LexicalUpdates';
import { $getNodeByKey, $setNodeKey } from './LexicalUtils';
import { $getSelection, BaseSelection } from './LexicalSelection';
import { $isTextNode } from './nodes/LexicalTextNode';

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
