import {DraftInlineStyle} from 'draft-js';
import * as Immutable from 'immutable';

import {Feature} from '../@feature';
import {
  characterListContainsEntityAlike,
  testCharacterListConsistency,
  unescapeMarkdown,
} from '../@utils';

import {createAutoTransformFeature} from './@auto-transform-feature';

const ASTERISK_BOLD_REGEX = /* /$asterisk-bold-markdown/ */ /(\*{2})((?:(?!\*{2})(?:\\[!"#$%&'()*+,.\/:;<=>?@^_`{}~\[\]\\\-]|(?!\\).|\\(?![!"#$%&'()*+,.\/:;<=>?@^_`{}~\[\]\\\-])))+)(\*{1,2})$/;
const UNDERSCORE_BOLD_REGEX = /* /$underscore-bold-markdown/ */ /(_{2})((?:(?!_{2})(?:\\[!"#$%&'()*+,.\/:;<=>?@^_`{}~\[\]\\\-]|(?!\\).|\\(?![!"#$%&'()*+,.\/:;<=>?@^_`{}~\[\]\\\-])))+)(_{1,2})$/;

const BOLD_STYLE: DraftInlineStyle = Immutable.OrderedSet(['BOLD']);

export function createBoldFeature(): Feature {
  return createAutoTransformFeature({
    matcher(leftText, input) {
      let leftTextWithInput = leftText + input;

      let groups =
        ASTERISK_BOLD_REGEX.exec(leftTextWithInput) ||
        UNDERSCORE_BOLD_REGEX.exec(leftTextWithInput);

      if (!groups) {
        return undefined;
      }

      /* /$asterisk-bold-markdown/ */
      let opening = groups[1];
      let textSource = groups[2];
      let closing = groups[3];

      let {markdownFragments, textFragments} = unescapeMarkdown(textSource);

      return {
        preMatch: closing.length < 2,
        opening,
        closing,
        markdownFragments,
        textFragments,
        style: BOLD_STYLE,
      };
    },
    compatibilityTester(opening, _content, closing) {
      return (
        testCharacterListConsistency(opening) &&
        testCharacterListConsistency(closing) &&
        !characterListContainsEntityAlike([...opening, ...closing])
      );
    },
  });
}
