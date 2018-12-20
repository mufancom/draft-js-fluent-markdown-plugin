import {
  ContentBlock,
  DraftDecorator,
  DraftHandleValue,
  EditorState,
} from 'draft-js';
import {EditorPluginFunctions} from 'draft-js-plugins-editor';

import {AtomicDescriptor, AtomicDescriptorEntry} from './@atomic';
import {createImageAtomicComponentEntry} from './@atomics';
import {
  LinkDecoratorOptions,
  createCodeDecorator,
  createLinkDecorator,
} from './@decorators';
import {Feature, FeatureOptions, FeatureTrigger} from './@feature';
import {
  createBoldFeature,
  createCodeFeature,
  createImageFeature,
  createItalicFeature,
  createLinkFeature,
  createStrikethroughFeature,
} from './@features';
import {
  getBlockEntityTypeAt,
  handleInlineStyleOverriding,
  splitBlockAndPush,
} from './@utils';

export interface FluentMarkdownPluginLinkOptions extends LinkDecoratorOptions {}

export interface FluentMarkdownPluginOptions {
  link?: FluentMarkdownPluginLinkOptions;
  block?: boolean;
}

export class FluentMarkdownPlugin {
  decorators: DraftDecorator[];

  private atomicDescriptorMap: Map<string, AtomicDescriptor>;

  private features: Feature[];

  constructor({
    block = true,
    link: linkOptions = {},
  }: FluentMarkdownPluginOptions) {
    this.decorators = [createCodeDecorator(), createLinkDecorator(linkOptions)];

    let atomicComponentEntries: AtomicDescriptorEntry[] = [];

    let features: Feature[] = [
      createBoldFeature(),
      createItalicFeature(),
      createStrikethroughFeature(),
      createCodeFeature(),
      createLinkFeature(),
    ];

    if (block) {
      atomicComponentEntries.push(createImageAtomicComponentEntry());

      features.push(createImageFeature());
    }

    this.atomicDescriptorMap = new Map(atomicComponentEntries);

    this.features = features;
  }

  blockRendererFn = (
    block: ContentBlock,
    {getEditorState}: EditorPluginFunctions,
  ): unknown => {
    if (block.getType() !== 'atomic') {
      return undefined;
    }

    let contentState = getEditorState().getCurrentContent();

    let entityType = getBlockEntityTypeAt(block, 0, contentState);

    if (!entityType) {
      return undefined;
    }

    let descriptor = this.atomicDescriptorMap.get(entityType);

    return descriptor && {...descriptor, editable: false};
  };

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
          nextEditorState = splitBlockAndPush(editorState);
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
