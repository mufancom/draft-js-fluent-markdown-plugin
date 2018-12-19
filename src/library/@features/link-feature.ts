import {DraftInlineStyle} from 'draft-js';
import {OrderedSet} from 'immutable';

import {Feature} from '../@feature';
import {unescapeMarkdown} from '../@utils';

import {createAutoConversionFeature} from './@auto-conversion-feature';

const LINK_REGEX = /(\[)((?:\\.|(?!\]).)+)(\]\(((?:\\.|(?![\\)])\S)+?)\))$/;

const LINK_STYLE: DraftInlineStyle = OrderedSet(['LINK']);

export function createLinkFeature(): Feature {
  return createAutoConversionFeature({
    style: LINK_STYLE,
    matcher(textBeforeOffset) {
      let groups = LINK_REGEX.exec(textBeforeOffset);

      if (!groups) {
        return undefined;
      }

      let [, opening, textMarkdownSource, closing, urlMarkdownSource] = groups;

      let {markdownFragments, textFragments} = unescapeMarkdown(
        textMarkdownSource,
      );

      let {text: href} = unescapeMarkdown(urlMarkdownSource);

      return {
        markdownFragments: [opening, ...markdownFragments, closing],
        textFragments: ['', ...textFragments, ''],
        entity: {
          type: 'LINK',
          mutability: 'MUTABLE',
          data: {href},
        },
      };
    },
    characterCompatibilityTester(metadata, nextMetadata) {
      return (
        !metadata.hasStyle('CODE') &&
        (!nextMetadata || metadata.getStyle().equals(nextMetadata.getStyle()))
      );
    },
  });
}
