import {ContentBlock, EditorState} from 'draft-js';

export interface FeatureTrigger {
  input?: string;
  command?: string;
}

export interface FeatureOptions {
  trigger: FeatureTrigger;
  offset: number;
  block: ContentBlock;
  blockKey: string;
  blockTextBeforeOffset: string;
  blockTextAfterOffset: string;
}

export type Feature = (
  editorState: EditorState,
  options: FeatureOptions,
) => EditorState;
