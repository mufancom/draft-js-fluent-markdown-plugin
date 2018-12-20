import {
  CharacterMetadata,
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

  let currentStyle = block.getInlineStyleAt(startOffset - 1);
  let nextStyle = block.getInlineStyleAt(endOffset);

  if (currentStyle.has('CODE') && !nextStyle.has('CODE')) {
    return EditorState.setInlineStyleOverride(editorState, nextStyle);
  }

  return editorState;
}

export function isCharacterMetadataEntityAlike(
  metadata: CharacterMetadata,
): boolean {
  return !!metadata.getEntity() || metadata.hasStyle('CODE');
}

export function characterListContainsEntityAlike(
  list: CharacterMetadata[],
): boolean {
  return list.some(metadata => isCharacterMetadataEntityAlike(metadata));
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
