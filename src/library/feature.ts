import {
  ContentBlock,
  ContentState,
  EditorState,
  SelectionState,
} from 'draft-js';

export interface FeatureTrigger {
  input?: string;
  command?: string;
}

export interface FeatureOptions {
  offset: number;
  trigger: FeatureTrigger;
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
