import {DraftInlineStyle} from 'draft-js';
import * as Immutable from 'immutable';

import {Feature} from '../@feature';
import {
  characterListContainsEntityAlike,
  testCharacterListConsistency,
  unescapeMarkdown,
} from '../@utils';

import {createAutoTransformFeature} from './@auto-transform-feature';

const LINK_REGEX = /* /$link-markdown/ */ /(?:^|(?!!).)(\[)((?:(?!\])(?:\\[!"#$%&'()*+,.\/:;<=>?@^_`{}~\[\]\\\-]|(?!\\).|\\(?![!"#$%&'()*+,.\/:;<=>?@^_`{}~\[\]\\\-])))+)(\]\(((?:(?![\s)])(?:\\[!"#$%&'()*+,.\/:;<=>?@^_`{}~\[\]\\\-]|(?!\\).|\\(?![!"#$%&'()*+,.\/:;<=>?@^_`{}~\[\]\\\-])))+)\))$/m;

const LINK_STYLE: DraftInlineStyle = Immutable.OrderedSet(['LINK']);

export function createLinkFeature(): Feature {
  return createAutoTransformFeature({
    matcher(leftText, input) {
      let groups = LINK_REGEX.exec(leftText + input);

      if (!groups) {
        return undefined;
      }

      /* /$link-markdown/ */
      let opening = groups[1];
      let textSource = groups[2];
      let closing = groups[3];
      let hrefSource = groups[4];

      let {markdownFragments, textFragments} = unescapeMarkdown(textSource);

      let {text: href} = unescapeMarkdown(hrefSource);

      return {
        opening,
        closing,
        markdownFragments,
        textFragments,
        style: LINK_STYLE,
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
        !characterListContainsEntityAlike([...opening, ...content, ...closing])
      );
    },
  });
}
