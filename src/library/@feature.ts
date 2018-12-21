import {ContentBlock, EditorState} from 'draft-js';

export interface FeatureOptions {
  offset: number;
  input: string;
  block: ContentBlock;
  blockKey: string;
  leftText: string;
  rightText: string;
}

export type Feature = (
  editorState: EditorState,
  options: FeatureOptions,
) => EditorState | undefined;
