import {
  CharacterMetadata,
  ContentState,
  EditorState,
  Modifier,
  SelectionState,
} from 'draft-js';
import * as Immutable from 'immutable';

import {Feature} from '../@feature';

export interface AutoBlockFeatureMatchResult {
  type: string;
  data?: object;
}

export interface AutoBlockFeatureOptions {
  matcher(
    leftText: string,
    input: string,
  ): AutoBlockFeatureMatchResult | undefined;
  compatibilityTester(list: CharacterMetadata[]): boolean;
}

export function createAutoBlockFeature({
  matcher,
  compatibilityTester,
}: AutoBlockFeatureOptions): Feature {
  return (editorState, {offset, input, block, blockKey, leftText}) => {
    let result = matcher(leftText, input);

    if (!result) {
      return undefined;
    }

    let {type, data = {}} = result;

    let currentInlineStyle = editorState.getCurrentInlineStyle();

    let characterList = block.getCharacterList().toArray();

    let inputCharacterList = new Array<CharacterMetadata>(input.length).fill(
      CharacterMetadata.create({
        style: currentInlineStyle,
      }),
    );

    let leftCharacterList = [
      ...characterList.slice(0, offset),
      ...inputCharacterList,
    ];

    if (!compatibilityTester(leftCharacterList)) {
      return undefined;
    }

    let content = editorState.getCurrentContent();
    let selection = editorState.getSelection();

    ////////////////////
    // PHASE 1: INPUT //
    ////////////////////

    content = Modifier.insertText(
      content,
      selection,
      input,
      currentInlineStyle,
    );

    editorState = EditorState.push(editorState, content, 'insert-characters');

    /////////////////////////////
    // PHASE 2: SET BLOCK TYPE //
    /////////////////////////////

    let blockRange = SelectionState.createEmpty(blockKey);

    let leftRange = blockRange.merge({
      anchorOffset: 0,
      focusOffset: offset + input.length,
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
