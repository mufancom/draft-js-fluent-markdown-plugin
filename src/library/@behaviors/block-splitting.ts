import {ContentState, EditorState, Modifier, SelectionState} from 'draft-js';

import {getContentSelectionAmbient} from '../@utils';

const DOWNGRADING_BLOCK_TYPE_SET = new Set([
  'header-one',
  'header-two',
  'header-three',
  'header-four',
  'header-five',
  'header-six',
]);

export function handleBlockSplitting(editorState: EditorState): EditorState {
  let {
    content,
    selection,
    leftBlockKey,
    leftBlock,
  } = getContentSelectionAmbient(editorState);

  if (!DOWNGRADING_BLOCK_TYPE_SET.has(leftBlock.getType())) {
    return editorState;
  }

  content = Modifier.splitBlock(content, selection);

  let followingLeftBlockKey = content.getKeyAfter(leftBlockKey);
  let followingLeftBlockRange = SelectionState.createEmpty(
    followingLeftBlockKey,
  );

  content = Modifier.setBlockType(content, followingLeftBlockRange, 'unstyled');

  let selectionAfter = followingLeftBlockRange.merge({
    hasFocus: true,
  });

  content = content.merge({
    selectionAfter,
  }) as ContentState;

  editorState = EditorState.push(editorState, content, 'split-block');

  return editorState;
}
