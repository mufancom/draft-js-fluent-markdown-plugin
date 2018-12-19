import {DraftDecorator, DraftDecoratorComponentProps} from 'draft-js';
import React, {FunctionComponent} from 'react';

import {linkify} from '../@utils';

export interface LinkDecoratorOptions {
  /** Defaults to `'_blank'`. */
  target?: string;
}

export function createLinkDecorator({
  target = '_blank',
}: LinkDecoratorOptions): DraftDecorator {
  const Link: FunctionComponent<DraftDecoratorComponentProps> = ({
    children,
    decoratedText,
  }) => {
    let {url} = linkify.match(decoratedText)![0];

    return (
      <a target={target} href={url}>
        {children}
      </a>
    );
  };

  return {
    component: Link,
    strategy(block, callback) {
      let text = block.getText();
      let links = linkify.match(text);

      if (!links) {
        return;
      }

      for (let link of links) {
        callback(link.index, link.lastIndex);
      }
    },
  };
}
