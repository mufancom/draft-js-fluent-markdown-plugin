import {DraftHandleValue, EditorState} from 'draft-js';
import {EditorPluginFunctions} from 'draft-js-plugins-editor';
import {SyntheticEvent} from 'react';

import {Feature, FeatureOptions} from './feature';
import {FULL_FEATURES} from './features';

export interface FluentMarkdownPluginOptions {
  features?: Feature[];
}

export class FluentMarkdownPlugin {
  private features: Feature[];

  constructor({features = FULL_FEATURES}: FluentMarkdownPluginOptions) {
    this.features = features;
  }

  handleBeforeInput = (
    character: string,
    editorState: EditorState,
    {setEditorState}: EditorPluginFunctions,
  ): DraftHandleValue => {
    let selection = editorState.getSelection();
    let content = editorState.getCurrentContent();

    let blockKey = selection.getStartKey();
    let block = content.getBlockForKey(blockKey);

    let blockText = block.getText();
    let offset = selection.getStartOffset();
    let blockTextBeforeOffset = blockText.slice(0, offset);
    let blockTextAfterOffset = blockText.slice(offset);

    let options: FeatureOptions = {
      offset,
      character,
      content,
      selection,
      block,
      blockKey,
      blockTextBeforeOffset,
      blockTextAfterOffset,
    };

    for (let feature of this.features) {
      let nextEditorState = feature(editorState, options);

      if (nextEditorState !== editorState) {
        setEditorState(nextEditorState);
        return 'handled';
      }
    }

    return 'not-handled';
  };

  handleReturn = (
    _event: SyntheticEvent,
    editorState: EditorState,
    functions: EditorPluginFunctions,
  ): DraftHandleValue => {
    return this.handleBeforeInput('\n', editorState, functions);
  };
}

export function createFluentMarkdownPlugin(
  options: FluentMarkdownPluginOptions = {},
): FluentMarkdownPlugin {
  return new FluentMarkdownPlugin(options);
}
