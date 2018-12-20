import {DraftDecorator, DraftDecoratorComponentProps} from 'draft-js';
import React, {FunctionComponent} from 'react';

import {getCharacterEntityType} from '../@utils';

export function createCodeDecorator(): DraftDecorator {
  const Code: FunctionComponent<DraftDecoratorComponentProps> = ({
    children,
  }) => <code>{children}</code>;

  return {
    component: Code,
    strategy(block, callback, contentState) {
      block.findEntityRanges(
        metadata => getCharacterEntityType(metadata, contentState) === 'CODE',
        callback,
      );
    },
  };
}
