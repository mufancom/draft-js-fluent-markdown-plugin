import {DraftDecorator, DraftDecoratorComponentProps} from 'draft-js';
import React, {FunctionComponent} from 'react';

export function createCodeDecorator(): DraftDecorator {
  const Code: FunctionComponent<DraftDecoratorComponentProps> = ({
    children,
  }) => <code>{children}</code>;

  return {
    component: Code,
    strategy(block, callback) {
      block.findStyleRanges(metadata => metadata.hasStyle('CODE'), callback);
    },
  };
}
