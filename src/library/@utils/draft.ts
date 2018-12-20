import {
  CharacterMetadata,
  ContentState,
  DraftInlineStyle,
  EditorState,
  Modifier,
} from 'draft-js';
import * as Immutable from 'immutable';

const EMPTY_STYLE: DraftInlineStyle = Immutable.OrderedSet();

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

  let leftStyle = block.getInlineStyleAt(startOffset - 1);
  let rightStyle = block.getInlineStyleAt(endOffset);

  if (startOffset === 0 && rightStyle.has('CODE')) {
    return EditorState.setInlineStyleOverride(
      editorState,
      rightStyle.delete('CODE'),
    );
  }

  if (leftStyle.has('CODE') && !rightStyle.has('CODE')) {
    return EditorState.setInlineStyleOverride(
      editorState,
      leftStyle.delete('CODE'),
    );
  }

  return editorState;
}

export function characterListContainsEntity(
  list: CharacterMetadata[],
): boolean {
  return list.some(metadata => !!metadata.getEntity());
}

export function testCharacterListConsistency([
  first,
  ...rest
]: CharacterMetadata[]): boolean {
  let entityKey = first.getEntity();
  let style = first.getStyle();

  for (let metadata of rest) {
    if (
      metadata.getEntity() !== entityKey ||
      !metadata.getStyle().equals(style)
    ) {
      return false;
    }
  }

  return true;
}

export function getCharacterEntityType(
  metadata: CharacterMetadata,
  contentState: ContentState,
): string | undefined {
  let entityKey = metadata.getEntity();
  return entityKey ? contentState.getEntity(entityKey).getType() : undefined;
}
