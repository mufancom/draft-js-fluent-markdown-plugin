import {DraftInlineStyle} from 'draft-js';
import * as Immutable from 'immutable';

import {Feature} from '../@feature';
import {
  characterListContainsEntity,
  testCharacterListConsistency,
  unescapeMarkdown,
} from '../@utils';

import {createAutoConversionFeature} from './@auto-conversion-feature';

const LINK_REGEX = /(?:^|[^!])(\[)((?:\\.|(?!\]).)+)(\]\(((?:\\.|(?![\\)])\S)+?)\))$/;

const LINK_STYLE: DraftInlineStyle = Immutable.OrderedSet(['LINK']);

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
      return (
        testCharacterListConsistency(opening) &&
        testCharacterListConsistency(closing) &&
        !characterListContainsEntity([...opening, ...content, ...closing])
      );
    },
  });
}
