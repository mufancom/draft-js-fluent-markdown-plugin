import {
  ContentBlock,
  ContentState,
  EditorState,
  SelectionState,
} from 'draft-js';

export interface FeatureOptions {
  offset: number;
  character: string;
  content: ContentState;
  selection: SelectionState;
  block: ContentBlock;
  blockKey: string;
  blockTextBeforeOffset: string;
  blockTextAfterOffset: string;
}

export type Feature = (
  editorState: EditorState,
  options: FeatureOptions,
) => EditorState;
