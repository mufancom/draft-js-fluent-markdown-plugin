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
import {testCharacterListConsistency} from '../@utils';

export interface AutoTransformFeatureMatchEntityDescriptor {
  type: string;
  mutability: DraftEntityMutability;
  data?: object;
}

export interface AutoTransformFeatureMatchResult {
  type: 'pre-match' | 'match';
  opening: string;
  closing: string;
  markdownFragments: string[];
  textFragments: string[];
  entity?: AutoTransformFeatureMatchEntityDescriptor;
  atomic?: boolean;
}

export interface AutoTransformFeatureOptions {
  style: DraftInlineStyle;
  matcher(
    leftText: string,
    input: string,
    rightText: string,
  ): AutoTransformFeatureMatchResult | undefined;
  compatibilityTester(
    opening: CharacterMetadata[],
    content: CharacterMetadata[],
    closing: CharacterMetadata[],
  ): boolean;
}

export function createAutoTransformFeature({
  style,
  matcher,
  compatibilityTester,
}: AutoTransformFeatureOptions): Feature {
  return (
    editorState,
    {offset, input, block, blockKey, leftText, rightText},
  ) => {
    let result = matcher(leftText, input, rightText);

    if (!result) {
      return undefined;
    }

    let {
      type,
      opening,
      closing,
      markdownFragments,
      textFragments,
      entity: entityDescriptor,
      atomic,
    } = result;

    if (!Array.isArray(markdownFragments)) {
      throw new Error(
        'Expecting `markdownFragments` property of matcher result to be an array',
      );
    }

    if (!Array.isArray(textFragments)) {
      throw new Error(
        'Expecting `textFragments` property of matcher result to be an array',
      );
    }

    if (markdownFragments.length !== textFragments.length) {
      throw new Error(
        'Expecting `markdownFragments` and `textFragments` property of matcher result to have the same length',
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

    if (!(leftText + input).endsWith(markdown)) {
      throw new Error('Invalid matched markdown');
    }

    let text = textFragments.join('');

    // block:
    // [...][opening][content][closing-without-input][...]
    //      └ source │        └ content source end   └ source end
    //        start  └ content source start
    //
    // matched markdown:
    // [opening][content][closing-without-input][input]
    //
    // length from opening to closing without input:
    //   = markdown.length - input.length
    //
    // length of closing without input:
    //   = closing.length - input.length

    let currentInlineStyle = editorState.getCurrentInlineStyle();

    let sourceStartOffset = offset - (markdown.length - input.length);
    let contentSourceStartOffset = sourceStartOffset + opening.length;
    let contentSourceEndOffset = offset - (closing.length - input.length);
    let sourceEndOffset = offset;

    let inputCharacterList = new Array<CharacterMetadata>(input.length).fill(
      CharacterMetadata.create({
        style: currentInlineStyle,
      }),
    );

    let characterList = block.getCharacterList().toArray();

    let openingCharacterList = characterList.slice(
      sourceStartOffset,
      contentSourceStartOffset,
    );
    let contentCharacterList = characterList.slice(
      contentSourceStartOffset,
      contentSourceEndOffset,
    );
    let closingCharacterList = [
      ...characterList.slice(contentSourceEndOffset, sourceEndOffset),
      ...inputCharacterList,
    ];

    if (
      !compatibilityTester(
        openingCharacterList,
        contentCharacterList,
        closingCharacterList,
      )
    ) {
      return undefined;
    }

    let selection = editorState.getSelection();
    let finalSelectionAfter: SelectionState | undefined;

    let content = editorState.getCurrentContent();

    ////////////////////
    // PHASE 1: INPUT //
    ////////////////////

    let slippingCharacterList = characterList.slice(
      sourceEndOffset,
      sourceEndOffset + input.length,
    );

    if (
      rightText.startsWith(input) &&
      testCharacterListConsistency([
        ...inputCharacterList,
        ...slippingCharacterList,
      ])
    ) {
      // slip over matching sibling text

      let nextOffset = sourceEndOffset + input.length;

      let selectionAfter = selection.merge({
        anchorOffset: nextOffset,
        focusOffset: nextOffset,
      }) as SelectionState;

      if (type === 'pre-match') {
        editorState = EditorState.forceSelection(editorState, selectionAfter);
      }
    } else {
      content = Modifier.insertText(
        content,
        selection,
        input,
        currentInlineStyle,
      );

      editorState = EditorState.push(editorState, content, 'insert-characters');
    }

    if (type === 'pre-match') {
      return editorState;
    }

    ////////////////////////
    // PHASE 2: TRANSFORM //
    ////////////////////////

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

      // current content state:
      //      ┌──────────────── to be replaced ──────────────┐
      // [...][opening][content][closing-without-input][input][...]
      //      └ source start                           └ source end

      let sourceRange = SelectionState.createEmpty(blockKey).merge({
        anchorOffset: sourceStartOffset,
        focusOffset: sourceEndOffset + input.length,
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

      if (sourceStartOffset > 0) {
        // current content state:
        //      ┌ to be split
        // [...][zero-width-character][...]
        //      └ source start

        let sourceStart = SelectionState.createEmpty(blockKey).merge({
          anchorOffset: sourceStartOffset,
          focusOffset: sourceStartOffset,
        }) as SelectionState;

        content = Modifier.splitBlock(content, sourceStart);

        atomicBlockKey = content.getKeyAfter(blockKey);
      } else {
        atomicBlockKey = blockKey;
      }

      // 3. if the next block is not empty, split it to create an empty one.

      let nextBlockKey = content.getKeyAfter(atomicBlockKey);
      let nextBlock = content.getBlockForKey(nextBlockKey);

      if (!nextBlock || nextBlock.getLength()) {
        // current content state:
        //                       ┌ to be split
        // [zero-width-character][...]

        let atomicBlockEnd = SelectionState.createEmpty(atomicBlockKey).merge({
          anchorOffset: character.length,
          focusOffset: character.length,
        }) as SelectionState;

        content = Modifier.splitBlock(content, atomicBlockEnd);

        finalSelectionAfter = content.getSelectionAfter();
      } else {
        finalSelectionAfter = SelectionState.createEmpty(nextBlockKey);
      }

      // 4. and ↑ is a good time to record selection range.

      // current content state:
      // #1 [zero-width-character]
      // #2 [...]
      //    └ selection after

      // 5. transform the block to atomic block.

      // current content state:
      // ┌── to be set type ──┐
      // [zero-width-character]

      let atomicBlockRange = SelectionState.createEmpty(atomicBlockKey).merge({
        anchorOffset: 0,
        focusOffset: character.length,
      }) as SelectionState;

      content = Modifier.setBlockType(content, atomicBlockRange, 'atomic');
    } else {
      let blockWithInput = content.getBlockForKey(blockKey);

      // replace the markdown one fragment by another to preserve character
      // styles.
      [content] = markdownFragments.reduce<[ContentState, number, number]>(
        ([content, sourceOffset, outputOffset], source, index) => {
          let unescaped = textFragments[index];

          let range = SelectionState.createEmpty(blockKey).merge({
            anchorOffset: outputOffset,
            focusOffset: outputOffset + source.length,
          }) as SelectionState;

          let mergedStyle = blockWithInput
            .getInlineStyleAt(sourceOffset)
            .merge(style);

          let entityKey = blockWithInput.getEntityAt(sourceOffset);

          return [
            Modifier.replaceText(
              content,
              range,
              unescaped,
              mergedStyle,
              entityKey,
            ),
            sourceOffset + source.length,
            outputOffset + unescaped.length,
          ];
        },
        [content, sourceStartOffset, sourceStartOffset],
      );

      finalSelectionAfter = content.getSelectionAfter();

      let entityRange = SelectionState.createEmpty(blockKey).merge({
        anchorOffset: sourceStartOffset,
        focusOffset: sourceStartOffset + text.length,
      }) as SelectionState;

      if (entityKey) {
        content = Modifier.applyEntity(content, entityRange, entityKey);
      }
    }

    content = content.merge({
      selectionAfter: finalSelectionAfter.merge({hasFocus: true}),
    }) as ContentState;

    editorState = EditorState.push(editorState, content, 'change-inline-style');

    return editorState;
  };
}
