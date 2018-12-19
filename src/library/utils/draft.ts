import {DraftInlineStyle, EditorState, Modifier} from 'draft-js';
import {OrderedSet} from 'immutable';

const EMPTY_STYLE: DraftInlineStyle = OrderedSet();

export function splitBlock(editorState: EditorState): EditorState {
  let content = editorState.getCurrentContent();
  let selection = editorState.getSelection();

  content = Modifier.splitBlock(content, selection);

  return EditorState.push(editorState, content, 'split-block');
}

export function handleInlineStyleOverriding(
  editorState: EditorState,
): EditorState {
  if (editorState.getInlineStyleOverride()) {
    return editorState;
  }

  let content = editorState.getCurrentContent();
  let selection = editorState.getSelection();

  let startOffset = selection.getStartOffset();
  let endOffset = selection.getEndOffset();

  let blockKey = selection.getStartKey();
  let block = content.getBlockForKey(blockKey);
  let blockLength = block.getLength();

  // Empty block

  if (!blockLength) {
    return EditorState.setInlineStyleOverride(editorState, EMPTY_STYLE);
  }

  // Code boundary

  let currentStyle = block.getInlineStyleAt(startOffset - 1);
  let nextStyle = block.getInlineStyleAt(endOffset);

  if (currentStyle.has('CODE') && !nextStyle.has('CODE')) {
    return EditorState.setInlineStyleOverride(editorState, nextStyle);
  }

  return editorState;
}
