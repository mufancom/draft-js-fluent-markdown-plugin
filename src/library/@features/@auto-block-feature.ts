import {
  CharacterMetadata,
  ContentState,
  EditorState,
  Modifier,
  SelectionState,
} from 'draft-js';
import * as Immutable from 'immutable';

import {Feature} from '../@feature';
import {getContentSelectionAmbient} from '../@utils';

export interface AutoBlockFeatureMatchResult {
  type: string;
  data?: object;
  autoBlockTypeBlacklist: Set<string>;
}

export interface AutoBlockFeatureOptions {
  matcher(
    leftText: string,
    input: string,
    rightText: string,
  ): AutoBlockFeatureMatchResult | undefined;
  compatibilityTester(list: CharacterMetadata[]): boolean;
}

export function createAutoBlockFeature({
  matcher,
  compatibilityTester,
}: AutoBlockFeatureOptions): Feature {
  return (input, editorState) => {
    let {
      content,
      selection,
      leftOffset,
      leftBlock,
      leftBlockKey,
      leftText,
      rightText,
    } = getContentSelectionAmbient(editorState);

    let result = matcher(leftText, input, rightText);

    if (!result) {
      return undefined;
    }

    let {type, data = {}, autoBlockTypeBlacklist} = result;

    if (autoBlockTypeBlacklist.has(leftBlock.getType())) {
      return;
    }

    let currentInlineStyle = editorState.getCurrentInlineStyle();

    let characterList = leftBlock.getCharacterList().toArray();

    let inputCharacterList = new Array<CharacterMetadata>(input.length).fill(
      CharacterMetadata.create({
        style: currentInlineStyle,
      }),
    );

    let leftCharacterList = [
      ...characterList.slice(0, leftOffset),
      ...inputCharacterList,
    ];

    if (!compatibilityTester(leftCharacterList)) {
      return undefined;
    }

    ////////////////////
    // PHASE 1: INPUT //
    ////////////////////

    content = Modifier.replaceText(
      content,
      selection,
      input,
      currentInlineStyle,
    );

    editorState = EditorState.push(editorState, content, 'insert-characters');

    /////////////////////////////
    // PHASE 2: SET BLOCK TYPE //
    /////////////////////////////

    let blockRange = SelectionState.createEmpty(leftBlockKey);

    let leftRange = blockRange.merge({
      anchorOffset: 0,
      focusOffset: leftOffset + input.length,
    }) as SelectionState;

    content = Modifier.removeRange(content, leftRange, 'backward');

    content = Modifier.setBlockType(content, blockRange, type);
    content = Modifier.setBlockData(content, blockRange, Immutable.Map(data));

    content = content.merge({
      selectionAfter: blockRange.merge({hasFocus: true}),
    }) as ContentState;

    editorState = EditorState.push(editorState, content, 'change-block-type');

    return editorState;
  };
}
