import {DraftInlineStyle} from 'draft-js';
import {OrderedSet} from 'immutable';

import {Feature} from '../@feature';
import {
  characterListContainsEntityAlike,
  testCharacterListConsistency,
  unescapeMarkdown,
} from '../@utils';

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
        opening,
        closing,
        markdownFragments,
        textFragments,
        entity: {
          type: 'LINK',
          mutability: 'MUTABLE',
          data: {href},
        },
      };
    },
    compatibilityTester(opening, content, closing) {
      let list = [...opening, ...content, ...closing];

      return (
        !characterListContainsEntityAlike(list) &&
        testCharacterListConsistency(list)
      );
    },
  });
}
