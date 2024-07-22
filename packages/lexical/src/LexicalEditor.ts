export type CreateEditorArgs = {};

export function createEditor(editorConfig?: CreateEditorArgs): LexicalEditor {
  const editor = new LexicalEditor();

  return editor;
}

export class LexicalEditor {}
