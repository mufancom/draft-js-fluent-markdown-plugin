import {
  CharacterMetadata,
  DraftDecorator,
  DraftDecoratorComponentProps,
} from 'draft-js';
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
    contentState,
    decoratedText,
    entityKey,
    children,
  }) => {
    let href: string;

    if (entityKey) {
      href = contentState.getEntity(entityKey).getData().href;
    } else {
      href = linkify.match(decoratedText)![0].url;
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
      let text = block.getText();

      text = block
        .getCharacterList()
        .map((metadata: CharacterMetadata, index: number) => {
          let entityKey = metadata.getEntity();

          if (entityKey) {
            let entityType = contentState.getEntity(entityKey).getType();

            if (entityType === 'LINK') {
              callback(index, index + 1);
            }

            return ' ';
          } else {
            return text[index];
          }
        })
        .join('');

      let links = linkify.match(text);

      if (links) {
        for (let link of links) {
          callback(link.index, link.lastIndex);
        }
      }
    },
  };
}
