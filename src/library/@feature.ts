import {EditorState} from 'draft-js';

export type Feature = (
  input: string,
  editorState: EditorState,
) => EditorState | undefined;
