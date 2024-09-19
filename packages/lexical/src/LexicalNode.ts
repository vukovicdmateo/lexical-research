import invariant from 'shared/invariant';

export type NodeKey = string;

export class LexicalNode {
  // TODO: (1) continue here with two lines commented bellow
  // Allow us to look up the type including static props
  //['constructor']!: KlassConstructor<typeof LexicalNode>;
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
}

export type NodeMap = Map<NodeKey, LexicalNode>;
