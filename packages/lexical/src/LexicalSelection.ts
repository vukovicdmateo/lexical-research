import type { NodeKey } from './LexicalNode';
import { LexicalNode } from './LexicalNode';
import type { TextNode } from './nodes/LexicalTextNode';
import type { ElementNode } from './nodes/LexicalElementNode';
import {
  getActiveEditorState,
  isCurrentlyReadOnlyMode,
} from './LexicalUpdates';
import { $isElementNode } from './nodes/LexicalElementNode';

export type TextPointType = {
  _selection: BaseSelection;
  getNode: () => TextNode;
  is: (point: PointType) => boolean;
  isBefore: (point: PointType) => boolean;
  key: NodeKey;
  offset: number;
  set: (key: NodeKey, offset: number, type: 'text' | 'element') => void;
  type: 'text';
};

export type ElementPointType = {
  _selection: BaseSelection;
  getNode: () => ElementNode;
  is: (point: PointType) => boolean;
  isBefore: (point: PointType) => boolean;
  key: NodeKey;
  offset: number;
  set: (key: NodeKey, offset: number, type: 'text' | 'element') => void;
  type: 'element';
};

export type PointType = TextPointType | ElementPointType;

export interface BaseSelection {
  _cachedNodes: Array<LexicalNode> | null;
  dirty: boolean;

  clone(): BaseSelection;
  extract(): Array<LexicalNode>;
  getNodes(): Array<LexicalNode>;
  getTextContent(): string;
  insertText(text: string): void;
  insertRawText(text: string): void;
  is(selection: null | BaseSelection): boolean;
  insertNodes(nodes: Array<LexicalNode>): void;
  getStartEndPoints(): null | [PointType, PointType];
  isCollapsed(): boolean;
  isBackward(): boolean;
  getCachedNodes(): LexicalNode[] | null;
  setCachedNodes(nodes: LexicalNode[] | null): void;
}

// @ts-ignore TODO: (1) Continue here
export class RangeSelection implements BaseSelection {
  format: number;
  style: string;
  anchor: PointType;
  focus: PointType;
  _cachedNodes: Array<LexicalNode> | null;
  dirty: boolean;

  constructor(
    anchor: PointType,
    focus: PointType,
    format: number,
    style: string
  ) {
    this.anchor = anchor;
    this.focus = focus;
    // TODO: check this out
    anchor._selection = this;
    focus._selection = this;
    this._cachedNodes = null;
    this.format = format;
    this.style = style;
    this.dirty = false;
  }

  getCachedNodes(): LexicalNode[] | null {
    return this._cachedNodes;
  }

  setCachedNodes(nodes: LexicalNode[] | null): void {
    this._cachedNodes = nodes;
  }

  /**
   * Used to check if the provided selections is equal to this one by value,
   * inluding anchor, focus, format, and style properties.
   * @param selection - the Selection to compare this one to.
   * @returns true if the Selections are equal, false otherwise.
   */
  is(selection: null | BaseSelection): boolean {
    if (!$isRangeSelection(selection)) {
      return false;
    }
    return (
      this.anchor.is(selection.anchor) &&
      this.focus.is(selection.focus) &&
      this.format === selection.format &&
      this.style === selection.style
    );
  }

  /**
   * Returns whether the Selection is "collapsed", meaning the anchor and focus are
   * the same node and have the same offset.
   *
   */
  isCollapsed(): boolean {
    return this.anchor.is(this.focus);
  }

  /**
   * Gets all the nodes in the Selection. Uses caching to make it generally suitable
   * for use in hot paths.
   */
  getNodes(): Array<LexicalNode> {
    const cachedNodes = this._cachedNodes;
    if (cachedNodes !== null) {
      return cachedNodes;
    }

    const anchor = this.anchor;
    const focus = this.focus;
    const isBefore = anchor.isBefore(focus);
    const firstPoint = isBefore ? anchor : focus;
    const lastPoint = isBefore ? focus : anchor;
    let firstNode = firstPoint.getNode();
    let lastNode = lastPoint.getNode();
    const startOffset = firstPoint.offset;
    const endOffset = lastPoint.offset;

    if ($isElementNode(firstNode)) {
      const firstNodeDescendant =
        firstNode.getDescendantByIndex<ElementNode>(startOffset);
      firstNode = firstNodeDescendant != null ? firstNodeDescendant : firstNode;
    }

    if ($isElementNode(lastNode)) {
      let lastNodeDescendant =
        lastNode.getDescendantByIndex<ElementNode>(endOffset);
      // We don't want to over-select, as node selection infers the child before
      // the last descendant, not including that descendant.
      if (
        lastNodeDescendant !== null &&
        lastNodeDescendant !== firstNode &&
        lastNode.getChildAtIndex(endOffset) === lastNodeDescendant
      ) {
        lastNodeDescendant = lastNodeDescendant.getPreviousSibling();
      }
      lastNode = lastNodeDescendant != null ? lastNodeDescendant : lastNode;
    }

    let nodes: Array<LexicalNode>;

    if (firstNode.is(lastNode)) {
      if ($isElementNode(firstNode) && firstNode.getChildrenSize() > 0) {
        nodes = [];
      } else {
        nodes = [firstNode];
      }
    } else {
      nodes = firstNode.getNodesBetween(lastNode);
    }
    if (!isCurrentlyReadOnlyMode()) {
      this._cachedNodes = nodes;
    }
    return nodes;
  }
}

export function $isRangeSelection(x: unknown): x is RangeSelection {
  return x instanceof RangeSelection;
}

export function $getSelection(): null | BaseSelection {
  const editorState = getActiveEditorState();
  return editorState._selection;
}
