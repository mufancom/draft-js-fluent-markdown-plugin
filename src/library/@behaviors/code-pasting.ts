import {EditorState, Modifier} from 'draft-js';

import {getContentSelectionAmbient} from '../@utils';

export function handleCodePasting(
  editorState: EditorState,
  text: string,
): EditorState {
  let {content, selection, leftBlock} = getContentSelectionAmbient(editorState);

  if (leftBlock.getType() === 'code-block') {
    editorState = EditorState.push(
      editorState,
      Modifier.insertText(content, selection, text),
      'insert-characters',
    );
  }

  return editorState;
}
