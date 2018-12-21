import {
  CharacterMetadata,
  ContentBlock,
  ContentState,
  DraftEntityInstance,
  DraftInlineStyle,
  EditorState,
} from 'draft-js';
import * as Immutable from 'immutable';

const EMPTY_STYLE: DraftInlineStyle = Immutable.OrderedSet();

export function setBlockDepth(
  content: ContentState,
  key: string,
  depth: number,
): ContentState {
  let block = content.getBlockForKey(key);
  let blockMap = content.getBlockMap();

  block = block.merge({depth}) as ContentBlock;
  blockMap = blockMap.set(key, block);

  return content.merge({blockMap}) as ContentState;
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

export function getCharacterEntity(
  metadata: CharacterMetadata,
  contentState: ContentState,
): DraftEntityInstance | undefined {
  let entityKey = metadata.getEntity();
  return entityKey ? contentState.getEntity(entityKey) : undefined;
}

export function getCharacterEntityType(
  metadata: CharacterMetadata,
  contentState: ContentState,
): string | undefined {
  let entity = getCharacterEntity(metadata, contentState);
  return entity && entity.getType();
}

export function getCharacterEntityData<T>(
  metadata: CharacterMetadata,
  contentState: ContentState,
): T | undefined {
  let entity = getCharacterEntity(metadata, contentState);
  return entity && entity.getData();
}

export function getBlockEntityAt(
  block: ContentBlock,
  offset: number,
  contentState: ContentState,
): DraftEntityInstance | undefined {
  let entityKey = block.getEntityAt(offset);
  return entityKey ? contentState.getEntity(entityKey) : undefined;
}

export function getBlockEntityTypeAt(
  block: ContentBlock,
  offset: number,
  contentState: ContentState,
): string | undefined {
  let entity = getBlockEntityAt(block, offset, contentState);
  return entity && entity.getType();
}

export function getBlockEntityDataAt<T>(
  block: ContentBlock,
  offset: number,
  contentState: ContentState,
): T | undefined {
  let entity = getBlockEntityAt(block, offset, contentState);
  return entity && entity.getData();
}
