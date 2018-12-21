import {
  CharacterMetadata,
  ContentBlock,
  ContentState,
  DraftEntityInstance,
  EditorState,
  SelectionState,
} from 'draft-js';

export interface ContentSelectionAmbient {
  content: ContentState;
  selection: SelectionState;
  leftOffset: number;
  leftBlockKey: string;
  leftBlock: ContentBlock;
  leftText: string;
  rightOffset: number;
  rightBlockKey: string;
  rightBlock: ContentBlock;
  rightText: string;
}

export function getContentSelectionAmbient(
  editorState: EditorState,
): ContentSelectionAmbient {
  let selection = editorState.getSelection();
  let content = editorState.getCurrentContent();

  let leftBlockKey = selection.getStartKey();
  let leftBlock = content.getBlockForKey(leftBlockKey);

  let leftBlockText = leftBlock.getText();
  let leftOffset = selection.getStartOffset();

  let leftText = leftBlockText.slice(0, leftOffset);

  let rightBlockKey = selection.getEndKey();
  let rightBlock = content.getBlockForKey(rightBlockKey);

  let rightBlockText = rightBlock.getText();
  let rightOffset = selection.getEndOffset();

  let rightText = rightBlockText.slice(rightOffset);

  return {
    content,
    selection,
    leftOffset,
    leftBlockKey,
    leftBlock,
    leftText,
    rightOffset,
    rightBlockKey,
    rightBlock,
    rightText,
  };
}

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
