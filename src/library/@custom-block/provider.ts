import {ContentBlock} from 'draft-js';
import {EditorPluginFunctions} from 'draft-js-plugins-editor';

import {CheckboxListItemProvider} from './@checkbox-list-item';

export const customBlockProvider = (
  block: ContentBlock,
  editorPluginFunctions: EditorPluginFunctions,
): unknown => {
  switch (block.getType()) {
    case CheckboxListItemProvider.type:
      return CheckboxListItemProvider.provider(block, editorPluginFunctions);
    default:
      return undefined;
  }
};
