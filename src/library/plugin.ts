import {
  ContentBlock,
  DraftDecorator,
  DraftEditorCommand,
  DraftHandleValue,
  EditorState,
  RichUtils,
} from 'draft-js';
import {EditorPluginFunctions} from 'draft-js-plugins-editor';
import {KeyboardEvent} from 'react';

import {AtomicDescriptor, AtomicDescriptorEntry} from './@atomic';
import {
  createHorizontalRuleAtomicComponentEntry,
  createImageAtomicComponentEntry,
} from './@atomics';
import {
  TabIndentOptions,
  handleBlockSplitting,
  handleInlineStyleOverriding,
  handleMultilineBlockReturn,
  handleTabIndent,
} from './@behaviors';
import {
  LinkDecoratorOptions,
  createCodeDecorator,
  createLinkDecorator,
} from './@decorators';
import {Feature} from './@feature';
import {
  createBlockquoteFeature,
  createBoldFeature,
  createCodeBlockFeature,
  createCodeFeature,
  createHeaderFeature,
  createHorizontalRuleFeature,
  createImageFeature,
  createItalicFeature,
  createLinkFeature,
  createListFeature,
  createStrikethroughFeature,
} from './@features';

export interface FluentMarkdownPluginLinkOptions extends LinkDecoratorOptions {}

export interface FluentMarkdownPluginIndentOptions extends TabIndentOptions {}

export interface FluentMarkdownPluginOptions {
  block?: boolean;
  link?: FluentMarkdownPluginLinkOptions;
  indent?: FluentMarkdownPluginIndentOptions;
}

export class FluentMarkdownPlugin {
  decorators: DraftDecorator[];

  private atomicDescriptorMap: Map<string, AtomicDescriptor>;

  private features: Feature[];

  private indentOptions: FluentMarkdownPluginIndentOptions | undefined;

  constructor({
    block = true,
    link: linkOptions = {},
    indent: indentOptions,
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
      atomicComponentEntries.push(
        createImageAtomicComponentEntry(),
        createHorizontalRuleAtomicComponentEntry(),
      );

      features.push(
        createImageFeature(),
        createHeaderFeature(),
        createListFeature(),
        createBlockquoteFeature(),
        createCodeBlockFeature(),
        createHorizontalRuleFeature(),
      );
    }

    this.atomicDescriptorMap = new Map(atomicComponentEntries);

    this.features = features;

    this.indentOptions = indentOptions;
  }

  onTab = (
    event: KeyboardEvent,
    {getEditorState, setEditorState}: EditorPluginFunctions,
  ): DraftHandleValue => {
    let editorState = getEditorState();

    let nextEditorState = handleTabIndent(
      editorState,
      event,
      this.indentOptions,
    );

    if (nextEditorState === editorState) {
      nextEditorState = RichUtils.onTab(event, editorState, 4);
    }

    if (nextEditorState !== editorState) {
      setEditorState(nextEditorState);
      return 'handled';
    } else {
      return 'not-handled';
    }
  };

  blockRendererFn = (block: ContentBlock): unknown => {
    if (block.getType() !== 'atomic') {
      return undefined;
    }

    let data = block.getData();
    let type = data.get('type');

    let descriptor = this.atomicDescriptorMap.get(type);

    return descriptor && {...descriptor, editable: false};
  };

  handleBeforeInput = (
    input: string,
    editorState: EditorState,
    {setEditorState}: EditorPluginFunctions,
  ): DraftHandleValue => {
    let nextEditorState = this.triggerFeature(input, editorState);

    if (nextEditorState !== editorState) {
      setEditorState(nextEditorState);
      return 'handled';
    } else {
      return 'not-handled';
    }
  };

  handleReturn = (
    event: KeyboardEvent,
    editorState: EditorState,
    {setEditorState}: EditorPluginFunctions,
  ): DraftHandleValue => {
    let nextEditorState = handleMultilineBlockReturn(event, editorState);

    if (nextEditorState !== editorState) {
      setEditorState(nextEditorState);
      return 'handled';
    } else {
      return 'not-handled';
    }
  };

  handleKeyCommand = (
    command: DraftEditorCommand,
    editorState: EditorState,
    {setEditorState}: EditorPluginFunctions,
  ): DraftHandleValue => {
    let nextEditorState: EditorState | undefined;

    switch (command) {
      case 'split-block':
        nextEditorState = handleBlockSplitting(editorState);
        break;
    }

    if (nextEditorState && nextEditorState !== editorState) {
      setEditorState(nextEditorState);
      return 'handled';
    } else {
      return 'not-handled';
    }
  };

  onChange = (editorState: EditorState): EditorState => {
    return handleInlineStyleOverriding(editorState);
  };

  private triggerFeature(input: string, editorState: EditorState): EditorState {
    for (let feature of this.features) {
      let nextEditorState = feature(input, editorState);

      if (nextEditorState) {
        return nextEditorState;
      }
    }

    return editorState;
  }
}

export function createFluentMarkdownPlugin(
  options: FluentMarkdownPluginOptions = {},
): FluentMarkdownPlugin {
  return new FluentMarkdownPlugin(options);
}
