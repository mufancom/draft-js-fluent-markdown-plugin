import {
  CharacterMetadata,
  ContentBlock,
  ContentState,
  DraftEntityMutability,
  DraftInlineStyle,
  EditorState,
  Modifier,
  SelectionState,
} from 'draft-js';

import {Feature} from '../@feature';

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

    let content = editorState.getCurrentContent();

    ////////////////////
    // PHASE 1: INPUT //
    ////////////////////

    if (input) {
      if (input !== blockTextAfterOffset[0]) {
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
      }
    } else if (command === 'split-block') {
      content = Modifier.splitBlock(content, initialSelection);

      finalSelection = content.getSelectionAfter();

      editorState = EditorState.push(editorState, content, 'split-block');
    } else {
      return editorState;
    }

    ////////////////////////
    // PHASE 2: TRANSFORM //
    ////////////////////////

    let finalSelectionAfter: SelectionState;
    let entityKey: string | undefined;

    if (entityDescriptor) {
      let {type, mutability, data} = entityDescriptor;

      content = content.createEntity(type, mutability, data);

      entityKey = content.getLastCreatedEntityKey();
    }

    if (atomic) {
      if (!entityKey) {
        throw new Error('Entity descriptor is required for atomic block');
      }

      // 1. replace image markdown with zero-width character.

      let sourceRange = SelectionState.createEmpty(blockKey).merge({
        anchorOffset: offsetBeforeMarkdown,
        focusOffset: offset,
      }) as SelectionState;

      let character = '\u200b';

      content = Modifier.replaceText(
        content,
        sourceRange,
        character,
        undefined,
        entityKey,
      );

      // 2. if it's not at the beginning of the block, split it.

      let atomicBlockKey: string;
      let atomicBlock: ContentBlock;

      if (offsetBeforeMarkdown > 0) {
        let sourceStart = SelectionState.createEmpty(blockKey).merge({
          anchorOffset: offsetBeforeMarkdown,
          focusOffset: offsetBeforeMarkdown,
        }) as SelectionState;

        content = Modifier.splitBlock(content, sourceStart);

        atomicBlockKey = content.getKeyAfter(blockKey);
      } else {
        atomicBlockKey = blockKey;
      }

      // 3. if there are extra characters after the atomic content, split it.

      atomicBlock = content.getBlockForKey(atomicBlockKey);

      if (character.length < atomicBlock.getLength()) {
        let atomicBlockEnd = SelectionState.createEmpty(atomicBlockKey).merge({
          anchorOffset: character.length,
          focusOffset: character.length,
        }) as SelectionState;

        content = Modifier.splitBlock(content, atomicBlockEnd);
      }

      // 4. and now it's a good time to record selection range.

      finalSelectionAfter = content.getSelectionAfter();

      // 5. transform the block to atomic block.

      let atomicBlockRange = SelectionState.createEmpty(atomicBlockKey).merge({
        anchorOffset: 0,
        focusOffset: character.length,
      }) as SelectionState;

      content = Modifier.setBlockType(content, atomicBlockRange, 'atomic');
    } else {
      // replace the markdown one fragment by another to preserve character
      // styles.
      [content] = markdownFragments.reduce<[ContentState, number, number]>(
        ([content, sourceOffset, offset], source, index) => {
          let unescaped = textFragments[index];

          let range = SelectionState.createEmpty(blockKey).merge({
            anchorOffset: offset,
            focusOffset: offset + source.length,
          }) as SelectionState;

          let mergedStyle = block.getInlineStyleAt(sourceOffset).merge(style);
          let entityKey = block.getEntityAt(sourceOffset);

          return [
            Modifier.replaceText(
              content,
              range,
              unescaped,
              mergedStyle,
              entityKey,
            ),
            sourceOffset + source.length,
            offset + unescaped.length,
          ];
        },
        [content, offsetBeforeMarkdown, offsetBeforeMarkdown],
      );

      finalSelectionAfter = content.getSelectionAfter();

      let textRange = SelectionState.createEmpty(blockKey).merge({
        anchorOffset: offsetBeforeMarkdown,
        focusOffset: offsetBeforeMarkdown + text.length,
      }) as SelectionState;

      if (entityKey) {
        content = Modifier.applyEntity(content, textRange, entityKey);
      }
    }

    if (!finalSelection) {
      finalSelection = finalSelectionAfter.merge({
        anchorOffset: finalSelectionAfter.getAnchorOffset() + input.length,
        focusOffset: finalSelectionAfter.getFocusOffset() + input.length,
        hasFocus: true,
      }) as SelectionState;
    }

    content = content.merge({
      selectionAfter: finalSelection,
    }) as ContentState;

    editorState = EditorState.push(editorState, content, 'change-inline-style');

    // editorState = EditorState.acceptSelection(editorState, finalSelection);

    return editorState;
  };
}
