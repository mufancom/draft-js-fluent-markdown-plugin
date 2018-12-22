import {DraftInlineStyle} from 'draft-js';
import * as Immutable from 'immutable';

import {Feature} from '../@feature';
import {
  characterListContainsEntityAlike,
  testCharacterListConsistency,
  unescapeMarkdown,
} from '../@utils';

import {createAutoTransformFeature} from './@auto-transform-feature';

const STRIKETHROUGH_REGEX = /* /$strikethrough-markdown/ */ /(~{2})((?:(?!~{2})(?:\\[!"#$%&'()*+,.\/:;<=>?@^_`{}~\[\]\\\-]|(?!\\).|\\(?![!"#$%&'()*+,.\/:;<=>?@^_`{}~\[\]\\\-])))+)(~{1,2})$/m;

const STRIKETHROUGH_STYLE: DraftInlineStyle = Immutable.OrderedSet([
  'STRIKETHROUGH',
]);

export function createStrikethroughFeature(): Feature {
  return createAutoTransformFeature({
    matcher(leftText, input) {
      let groups = STRIKETHROUGH_REGEX.exec(leftText + input);

      if (!groups) {
        return undefined;
      }

      /* /$strikethrough-markdown/ */
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
        style: STRIKETHROUGH_STYLE,
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
