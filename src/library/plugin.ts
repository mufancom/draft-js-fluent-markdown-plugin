import {DraftDecorator, DraftHandleValue, EditorState} from 'draft-js';
import {EditorPluginFunctions} from 'draft-js-plugins-editor';

import {LinkDecoratorOptions, createLinkDecorator} from './@decorators';
import {Feature, FeatureOptions, FeatureTrigger} from './@feature';
import {
  createBoldFeature,
  createCodeFeature,
  createItalicFeature,
  createStrikethroughFeature,
} from './@features';
import {handleInlineStyleOverriding, splitBlock} from './@utils';

export interface FluentMarkdownPluginLinkOptions extends LinkDecoratorOptions {}

export interface FluentMarkdownPluginOptions {
  link?: FluentMarkdownPluginLinkOptions;
  block?: boolean;
}

export class FluentMarkdownPlugin {
  readonly decorators: DraftDecorator[];

  private features: Feature[];

  constructor({link: linkOptions = {}}: FluentMarkdownPluginOptions) {
    this.decorators = [createLinkDecorator(linkOptions)];

    this.features = [
      createBoldFeature(),
      createItalicFeature(),
      createStrikethroughFeature(),
      createCodeFeature(),
    ];
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
