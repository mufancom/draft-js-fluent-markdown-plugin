import {ContentBlock, ContentState, EditorState} from 'draft-js';

import {Feature} from '../@feature';
import {getContentSelectionAmbient} from '../@utils';

const CHECKBOX_LIST_REGEX = /^\[([xX ])] (.*)$/i;

export function createCheckboxListFeature(): Feature {
  return (input, editorState): EditorState => {
    let {leftBlock, leftText, rightText} = getContentSelectionAmbient(
      editorState,
    );

    if (leftBlock.getType() !== 'unordered-list-item') {
      return editorState;
    }

    let groups = CHECKBOX_LIST_REGEX.exec(leftText + input);

    if (!groups) {
      return editorState;
    }

    let checked = groups[1] !== ' ';
    let currentContent = editorState.getCurrentContent();
    let selection = editorState.getSelection();
    let key = selection.getStartKey();
    let blockMap = currentContent.getBlockMap();
    let block = blockMap.get(key);
    let data = block.getData().merge({checked});
    let newBlock = block.merge({
      type: 'checkbox-list-item',
      data,
      text: rightText || '',
    }) as ContentBlock;
    let newSelection = selection.merge({
      anchorOffset: 0,
      focusOffset: 0,
    });
    let newContentState = currentContent.merge({
      blockMap: blockMap.set(key, newBlock),
      selectionAfter: newSelection,
    }) as ContentState;

    return EditorState.push(editorState, newContentState, 'change-block-type');
  };
}
