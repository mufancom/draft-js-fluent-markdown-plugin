import {DraftInlineStyle, EditorState} from 'draft-js';
import * as Immutable from 'immutable';

const EMPTY_STYLE: DraftInlineStyle = Immutable.OrderedSet();

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

  // Style boundary

  let leftStyle = block.getInlineStyleAt(startOffset - 1);
  let rightStyle = block.getInlineStyleAt(endOffset);

  if (!leftStyle.equals(rightStyle)) {
    return EditorState.setInlineStyleOverride(
      editorState,
      leftStyle.intersect(rightStyle),
    );
  }

  return editorState;
}
