import {DraftHandleValue, EditorState} from 'draft-js';
import {EditorPluginFunctions} from 'draft-js-plugins-editor';

import {Feature, FeatureOptions, FeatureTrigger} from './@feature';
import {BLOCK_FEATURES, INLINE_FEATURES} from './@features';
import {handleInlineStyleOverriding, splitBlock} from './utils';

export interface FluentMarkdownPluginOptions {
  block?: boolean;
}

export class FluentMarkdownPlugin {
  private features: Feature[];

  constructor({block = true}: FluentMarkdownPluginOptions) {
    this.features = [...INLINE_FEATURES, ...(block ? BLOCK_FEATURES : [])];
  }

  handleBeforeInput = (
    input: string,
    editorState: EditorState,
    {setEditorState}: EditorPluginFunctions,
  ): DraftHandleValue => {
    let nextEditorState = this.triggerFeature(editorState, {input});

    if (nextEditorState) {
      setEditorState(nextEditorState);
      return 'handled';
    } else {
      return 'not-handled';
    }
  };

  handleKeyCommand = (
    command: string,
    editorState: EditorState,
    {setEditorState}: EditorPluginFunctions,
  ): DraftHandleValue => {
    let nextEditorState: EditorState | undefined;

    switch (command) {
      case 'split-block':
        nextEditorState = this.triggerFeature(editorState, {command});

        if (!nextEditorState) {
          nextEditorState = splitBlock(editorState);
        }

        break;
    }

    if (nextEditorState) {
      setEditorState(nextEditorState);
      return 'handled';
    } else {
      return 'not-handled';
    }
  };

  onChange = (editorState: EditorState): EditorState => {
    return handleInlineStyleOverriding(editorState);
  };

  private triggerFeature(
    editorState: EditorState,
    trigger: FeatureTrigger,
  ): EditorState | undefined {
    let selection = editorState.getSelection();
    let content = editorState.getCurrentContent();

    let blockKey = selection.getStartKey();
    let block = content.getBlockForKey(blockKey);

    let blockText = block.getText();
    let offset = selection.getStartOffset();
    let blockTextBeforeOffset = blockText.slice(0, offset);
    let blockTextAfterOffset = blockText.slice(offset);

    let options: FeatureOptions = {
      trigger,
      offset,
      block,
      blockKey,
      blockTextBeforeOffset,
      blockTextAfterOffset,
    };

    for (let feature of this.features) {
      let nextEditorState = feature(editorState, options);

      if (nextEditorState !== editorState) {
        return nextEditorState;
      }
    }

    return undefined;
  }
}

export function createFluentMarkdownPlugin(
  options: FluentMarkdownPluginOptions = {},
): FluentMarkdownPlugin {
  return new FluentMarkdownPlugin(options);
}
