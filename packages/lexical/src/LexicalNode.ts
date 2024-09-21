import invariant from 'shared/invariant';
import type { KlassConstructor } from './LexicalEditor';

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
}

export type NodeMap = Map<NodeKey, LexicalNode>;
