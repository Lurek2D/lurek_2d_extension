/** Per-editor content returned by getEditorContent(). */
export interface EditorContent {
  /** Custom HTML for the workspace area (replaces generic renderWorkspace). */
  readonly workspaceHtml: string;
  /** Additional CSS appended after sharedStyles(). */
  readonly styles: string;
  /** Custom client-side JavaScript (replaces generic interactiveClientScript). */
  readonly script: string;
}
