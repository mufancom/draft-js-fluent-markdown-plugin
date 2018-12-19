import {
  CharacterMetadata,
  DraftInlineStyle,
  EditorState,
  Modifier,
  SelectionState,
} from 'draft-js';
import {OrderedSet} from 'immutable';

import {Feature, FeatureOptions} from '../feature';

const NONE_STYLE: DraftInlineStyle = OrderedSet();

export interface InlineFeatureMatchResult {
  markdown: string[];
  text: string[];
}

export interface InlineFeatureOptions {
  style: DraftInlineStyle;
  matcher(
    blockTextBeforeOffset: string,
    blockTextAfterOffset: string,
  ): InlineFeatureMatchResult | undefined;
  characterCompatibilityTester(metadata: CharacterMetadata): boolean;
}

export function createInlineFeature({
  style,
  matcher,
  characterCompatibilityTester,
}: InlineFeatureOptions): Feature {
  return function processInlineFeature(
    editorState: EditorState,
    {
      trigger: {input = '', command},
      selection,
      offset,
      block,
      blockKey,
      blockTextBeforeOffset,
      blockTextAfterOffset,
    }: FeatureOptions,
  ): EditorState {
    let result = matcher(blockTextBeforeOffset, blockTextAfterOffset);

    if (!result) {
      return editorState;
    }

    let {markdown, text} = result;

    if (!Array.isArray(markdown)) {
      throw new Error(
        'Expecting `markdown` property of matcher result to be an array',
      );
    }

    if (!Array.isArray(text)) {
      throw new Error(
        'Expecting `text` property of matcher result to be an array',
      );
    }

    if (markdown.length !== text.length) {
      throw new Error(
        'Expecting `markdown` and `text` property of matcher result to have the same length',
      );
    }

    let markdownString = markdown.join('');
    let textString = text.join('');

    let draftCharacterMetadataItems = block
      .getCharacterList()
      .toArray()
      .slice(offset - markdownString.length, offset);

    if (
      draftCharacterMetadataItems.some(
        metadata => !characterCompatibilityTester(metadata),
      )
    ) {
      return editorState;
    }

    let finalSelection: SelectionState | undefined;
    let toResetStyle = false;

    // insert character

    if (input) {
      let insertionContent = editorState.getCurrentContent();

      insertionContent = Modifier.insertText(
        insertionContent,
        selection,
        input,
        block.getInlineStyleAt(offset),
      );

      editorState = EditorState.push(
        editorState,
        insertionContent,
        'insert-characters',
      );

      editorState = EditorState.acceptSelection(
        editorState,
        insertionContent.getSelectionAfter(),
      );
    } else if (command === 'split-block') {
      let splittingContent = editorState.getCurrentContent();

      splittingContent = Modifier.splitBlock(splittingContent, selection);

      finalSelection = splittingContent.getSelectionAfter();

      editorState = EditorState.push(
        editorState,
        splittingContent,
        'split-block',
      );

      editorState = EditorState.acceptSelection(editorState, finalSelection);

      toResetStyle = true;
    } else {
      return editorState;
    }

    // replace markdown with styled text

    let replacementOffset = offset - markdownString.length;
    let replacementContent = editorState.getCurrentContent();

    for (let [index, source] of markdown.entries()) {
      let unescaped = text[index];

      let range = SelectionState.createEmpty(blockKey).merge({
        anchorOffset: replacementOffset,
        focusOffset: replacementOffset + source.length,
      }) as SelectionState;

      let mergedStyle = block.getInlineStyleAt(replacementOffset).merge(style);

      replacementContent = Modifier.replaceText(
        replacementContent,
        range,
        unescaped,
        mergedStyle,
      );

      replacementOffset += unescaped.length;
    }

    if (!finalSelection) {
      let selectionOffset =
        offset + (textString.length - markdownString.length + input.length);

      finalSelection = selection.merge({
        anchorOffset: selectionOffset,
        focusOffset: selectionOffset,
      }) as SelectionState;
    }

    editorState = EditorState.push(
      editorState,
      replacementContent,
      'change-inline-style',
    );

    editorState = EditorState.acceptSelection(editorState, finalSelection);

    if (toResetStyle) {
      editorState = EditorState.setInlineStyleOverride(editorState, NONE_STYLE);
    }

    return editorState;
  };
}
