import {
  CharacterMetadata,
  ContentState,
  DraftEntityMutability,
  DraftInlineStyle,
  EditorState,
  Modifier,
  SelectionState,
} from 'draft-js';

import {Feature, FeatureOptions} from '../@feature';
import {splitBlock} from '../@utils';

export interface AutoConversionFeatureMatchEntityDescriptor {
  type: string;
  mutability: DraftEntityMutability;
  data: object;
}

export interface AutoConversionFeatureMatchResult {
  opening: string;
  closing: string;
  markdownFragments: string[];
  textFragments: string[];
  entity?: AutoConversionFeatureMatchEntityDescriptor;
}

export interface AutoConversionFeatureOptions {
  style: DraftInlineStyle;
  matcher(
    blockTextBeforeOffset: string,
    blockTextAfterOffset: string,
  ): AutoConversionFeatureMatchResult | undefined;
  compatibilityTester(
    opening: CharacterMetadata[],
    content: CharacterMetadata[],
    closing: CharacterMetadata[],
  ): boolean;
}

export function createAutoConversionFeature({
  style,
  matcher,
  compatibilityTester,
}: AutoConversionFeatureOptions): Feature {
  return function processInlineFeature(
    editorState: EditorState,
    {
      trigger: {input = '', command},
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

    let {
      opening,
      closing,
      markdownFragments,
      textFragments,
      entity: entityDescriptor,
    } = result;

    if (!Array.isArray(markdownFragments)) {
      throw new Error(
        'Expecting `markdown` property of matcher result to be an array',
      );
    }

    if (!Array.isArray(textFragments)) {
      throw new Error(
        'Expecting `text` property of matcher result to be an array',
      );
    }

    if (markdownFragments.length !== textFragments.length) {
      throw new Error(
        'Expecting `markdown` and `text` property of matcher result to have the same length',
      );
    }

    if (opening) {
      markdownFragments.unshift(opening);
      textFragments.unshift('');
    }

    if (closing) {
      markdownFragments.push(closing);
      textFragments.push('');
    }

    let markdown = markdownFragments.join('');
    let text = textFragments.join('');

    let offsetBeforeMarkdown = offset - markdown.length;
    let offsetAfterOpening = offsetBeforeMarkdown + opening.length;
    let offsetBeforeClosing = offset - closing.length;

    let characterList = block.getCharacterList().toArray();

    let openingCharacterList = characterList.slice(
      offsetBeforeMarkdown,
      offsetAfterOpening,
    );
    let contentCharacterList = characterList.slice(
      offsetAfterOpening,
      offsetBeforeClosing,
    );
    let closingCharacterList = characterList.slice(offsetBeforeClosing, offset);

    if (
      !compatibilityTester(
        openingCharacterList,
        contentCharacterList,
        closingCharacterList,
      )
    ) {
      return editorState;
    }

    let initialSelection = editorState.getSelection();
    let finalSelection: SelectionState | undefined;

    // insert character

    if (input) {
      let content = editorState.getCurrentContent();

      content = Modifier.insertText(
        content,
        initialSelection,
        input,
        block.getInlineStyleAt(offset),
      );

      editorState = EditorState.push(editorState, content, 'insert-characters');

      editorState = EditorState.acceptSelection(
        editorState,
        content.getSelectionAfter(),
      );
    } else if (command === 'split-block') {
      editorState = splitBlock(editorState);

      finalSelection = editorState.getCurrentContent().getSelectionAfter();
    } else {
      return editorState;
    }

    // replace markdown with styled text

    let [replacementContent] = markdownFragments.reduce<
      [ContentState, number, number]
    >(
      ([content, sourceOffset, offset], source, index) => {
        let unescaped = textFragments[index];

        let range = SelectionState.createEmpty(blockKey).merge({
          anchorOffset: offset,
          focusOffset: offset + source.length,
        }) as SelectionState;

        let mergedStyle = block.getInlineStyleAt(sourceOffset).merge(style);

        return [
          Modifier.replaceText(content, range, unescaped, mergedStyle),
          sourceOffset + source.length,
          offset + unescaped.length,
        ];
      },
      [
        editorState.getCurrentContent(),
        offsetBeforeMarkdown,
        offsetBeforeMarkdown,
      ],
    );

    if (entityDescriptor) {
      let {type, mutability, data} = entityDescriptor;

      replacementContent = replacementContent.createEntity(
        type,
        mutability,
        data,
      );

      let entityKey = replacementContent.getLastCreatedEntityKey();

      let range = SelectionState.createEmpty(blockKey).merge({
        anchorOffset: offsetBeforeMarkdown,
        focusOffset: offsetBeforeMarkdown + text.length,
      }) as SelectionState;

      replacementContent = Modifier.applyEntity(
        replacementContent,
        range,
        entityKey,
      );
    }

    editorState = EditorState.push(
      editorState,
      replacementContent,
      'change-inline-style',
    );

    if (!finalSelection) {
      let selectionOffset = offsetBeforeMarkdown + text.length + input.length;

      finalSelection = initialSelection.merge({
        anchorOffset: selectionOffset,
        focusOffset: selectionOffset,
      }) as SelectionState;
    }

    editorState = EditorState.acceptSelection(editorState, finalSelection);

    return editorState;
  };
}
