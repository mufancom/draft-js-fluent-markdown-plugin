import {
  CharacterMetadata,
  ContentState,
  DraftEntityMutability,
  DraftInlineStyle,
  EditorState,
  Modifier,
  SelectionState,
} from 'draft-js';

import {Feature} from '../@feature';
import {insertAtomicBlock, splitBlockAndPush} from '../@utils';

export interface AutoConversionFeatureMatchEntityDescriptor {
  type: string;
  mutability: DraftEntityMutability;
  data?: object;
}

export interface AutoConversionFeatureMatchResult {
  opening: string;
  closing: string;
  markdownFragments: string[];
  textFragments: string[];
  entity?: AutoConversionFeatureMatchEntityDescriptor;
  atomic?: boolean;
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
  return (
    editorState,
    {
      trigger: {input = '', command},
      offset,
      block,
      blockKey,
      blockTextBeforeOffset,
      blockTextAfterOffset,
    },
  ) => {
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
      atomic,
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
      if (input === blockTextAfterOffset[0]) {
        let selection = SelectionState.createEmpty(blockKey).merge({
          anchorOffset: initialSelection.getAnchorOffset() + input.length,
          focusOffset: initialSelection.getFocusOffset() + input.length,
          hasFocus: true,
        }) as SelectionState;

        editorState = EditorState.acceptSelection(editorState, selection);
      } else {
        let content = editorState.getCurrentContent();

        content = Modifier.insertText(
          content,
          initialSelection,
          input,
          block.getInlineStyleAt(offset),
        );

        editorState = EditorState.push(
          editorState,
          content,
          'insert-characters',
        );

        editorState = EditorState.acceptSelection(
          editorState,
          content.getSelectionAfter(),
        );
      }
    } else if (command === 'split-block') {
      // atomic block will naturally have a sibling block
      if (!atomic) {
        editorState = splitBlockAndPush(editorState);
        finalSelection = editorState.getCurrentContent().getSelectionAfter();
      }
    } else {
      return editorState;
    }

    // replace markdown with styled text

    let replacementContent = editorState.getCurrentContent();
    let finalRange: SelectionState;
    let entityKey: string | undefined;

    if (entityDescriptor) {
      let {type, mutability, data} = entityDescriptor;

      replacementContent = replacementContent.createEntity(
        type,
        mutability,
        data,
      );

      entityKey = replacementContent.getLastCreatedEntityKey();
    }

    if (atomic) {
      if (!entityKey) {
        throw new Error('Entity descriptor is required for atomic block');
      }

      let range = SelectionState.createEmpty(blockKey).merge({
        anchorOffset: offsetBeforeMarkdown,
        focusOffset: offset,
      }) as SelectionState;

      replacementContent = insertAtomicBlock(
        replacementContent,
        range,
        entityKey,
      );

      finalRange = replacementContent.getSelectionAfter();
    } else {
      [replacementContent] = markdownFragments.reduce<
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
        [replacementContent, offsetBeforeMarkdown, offsetBeforeMarkdown],
      );

      let range = SelectionState.createEmpty(blockKey).merge({
        anchorOffset: offsetBeforeMarkdown,
        focusOffset: offsetBeforeMarkdown + text.length,
      }) as SelectionState;

      finalRange = replacementContent.getSelectionAfter();

      if (entityKey) {
        replacementContent = Modifier.applyEntity(
          replacementContent,
          range,
          entityKey,
        );
      }
    }

    editorState = EditorState.push(
      editorState,
      replacementContent,
      'change-inline-style',
    );

    if (!finalSelection) {
      finalSelection = finalRange.merge({
        anchorOffset: finalRange.getAnchorOffset() + input.length,
        focusOffset: finalRange.getFocusOffset() + input.length,
        hasFocus: true,
      }) as SelectionState;
    }

    editorState = EditorState.acceptSelection(editorState, finalSelection);

    return editorState;
  };
}
