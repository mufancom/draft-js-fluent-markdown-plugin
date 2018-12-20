import {DraftDecorator, DraftDecoratorComponentProps} from 'draft-js';
import React, {FunctionComponent} from 'react';

import {getCharacterEntityType, linkify} from '../@utils';

export interface LinkEntityData {
  href: string;
}

export interface LinkDecoratorOptions {
  /** Defaults to `'_blank'`. */
  target?: string;
}

export function createLinkDecorator({
  target = '_blank',
}: LinkDecoratorOptions): DraftDecorator {
  const Link: FunctionComponent<DraftDecoratorComponentProps> = ({
    contentState,
    decoratedText,
    entityKey,
    children,
  }) => {
    let href: string;

    if (entityKey) {
      ({href} = contentState.getEntity(entityKey).getData() as LinkEntityData);
    } else {
      ({url: href} = linkify.match(decoratedText)![0]);
    }

    return (
      <a target={target} href={href}>
        {children}
      </a>
    );
  };

  return {
    component: Link,
    strategy(block, callback, contentState) {
      let entityRanges: [number, number][] = [];

      block.findEntityRanges(
        metadata => getCharacterEntityType(metadata, contentState) === 'LINK',
        (start, end) => {
          entityRanges.push([start, end]);
          callback(start, end);
        },
      );

      let characters = block.getText().split('');

      for (let [start, end] of entityRanges) {
        let length = end - start;
        characters.splice(start, end - start, ''.padEnd(length));
      }

      let text = characters.join('');

      let links = linkify.match(text);

      if (links) {
        for (let link of links) {
          callback(link.index, link.lastIndex);
        }
      }
    },
  };
}
