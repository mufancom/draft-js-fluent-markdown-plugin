import {ContentState, EditorState, Modifier, SelectionState} from 'draft-js';
import {KeyboardEvent} from 'react';

/**
 * `true`:
 *   - return to enter new line, two continuous EOF leads to block split.
 *   - ctrl to enter new line, ignore continuous EOF splitting.
 * `false`
 *   - ctrl to enter new line.
 */
const MULTILINE_BLOCK_TYPE_TO_DEFAULT_MAP = new Map([
  ['blockquote', true],
  ['code-block', true],
  ['unordered-list-item', false],
  ['ordered-list-item', false],
]);

const EOF = '\n';

export function handleMultilineBlockReturn(
  event: KeyboardEvent,
  editorState: EditorState,
): EditorState {
  let content = editorState.getCurrentContent();
  let selection = editorState.getSelection();

  let selectionStartOffset = selection.getStartOffset();
  let selectionEndOffset = selection.getEndOffset();

  let blockKey = selection.getStartKey();
  let block = content.getBlockForKey(blockKey);

  let blockType = block.getType();

  if (!MULTILINE_BLOCK_TYPE_TO_DEFAULT_MAP.has(blockType)) {
    return editorState;
  }

  let forceMultiline = !!event.ctrlKey;

  if (!forceMultiline && !MULTILINE_BLOCK_TYPE_TO_DEFAULT_MAP.get(blockType)) {
    return editorState;
  }

  let splitOnContinuousEOF = !forceMultiline;

  content = Modifier.replaceText(content, selection, EOF);

  editorState = EditorState.push(editorState, content, 'insert-characters');

  // re-render hack: it seems that Draft.js will not render changes from like
  // '\n' to '\n\n', use `forceSelection` to force re-rendering.
  editorState = EditorState.forceSelection(
    editorState,
    content.getSelectionAfter(),
  );

  if (!splitOnContinuousEOF) {
    return editorState;
  }

  // text before insert EOF
  let text = block.getText();

  let leftText = text.slice(0, selectionStartOffset);
  let rightText = text.slice(selectionEndOffset);

  if (!leftText.endsWith(EOF)) {
    return editorState;
  }

  // left splitting range contains the last 2 EOF.
  let continuousEOFRange = SelectionState.createEmpty(blockKey).merge({
    anchorOffset: selectionStartOffset - EOF.length,
    focusOffset: selectionStartOffset + EOF.length,
  }) as SelectionState;

  content = Modifier.splitBlock(content, continuousEOFRange);

  let nextBlockKey = content.getKeyAfter(blockKey);
  let nextBlockRange = SelectionState.createEmpty(nextBlockKey);

  if (rightText) {
    if (rightText.startsWith(EOF)) {
      let precedingEOFRange = SelectionState.createEmpty(nextBlockKey).merge({
        anchorOffset: 0,
        focusOffset: EOF.length,
      }) as SelectionState;

      content = Modifier.removeRange(content, precedingEOFRange, 'backward');
    }

    content = Modifier.splitBlock(content, nextBlockRange);
  }

  let parentBlock = block.getDepth()
    ? content.getBlockBefore(blockKey)
    : undefined;

  let nextBlockType = parentBlock ? parentBlock.getType() : 'unstyled';

  content = Modifier.setBlockType(content, nextBlockRange, nextBlockType);

  content = content.merge({
    selectionAfter: nextBlockRange.merge({hasFocus: true}),
  }) as ContentState;

  editorState = EditorState.push(editorState, content, 'split-block');

  return editorState;
}
