import {DraftInlineStyle} from 'draft-js';
import * as Immutable from 'immutable';

import {Feature} from '../@feature';
import {
  characterListContainsEntity,
  testCharacterListConsistency,
  unescapeMarkdown,
} from '../@utils';

import {createAutoTransformFeature} from './@auto-transform-feature';

const ASTERISK_BOLD_REGEX = /(\*{2})((?:\\.|(?!\\|\*{2}).)+)(\*{1,2})$/;
const UNDERLINE_BOLD_REGEX = /(_{2})((?:\\.|(?!\\|_{2}).)+)(_{1,2})$/;

const BOLD_STYLE: DraftInlineStyle = Immutable.OrderedSet(['BOLD']);

export function createBoldFeature(): Feature {
  return createAutoTransformFeature({
    style: BOLD_STYLE,
    matcher(leftText, input) {
      let leftTextWithInput = leftText + input;

      let groups =
        ASTERISK_BOLD_REGEX.exec(leftTextWithInput) ||
        UNDERLINE_BOLD_REGEX.exec(leftTextWithInput);

      if (!groups) {
        return undefined;
      }

      let [, opening, markdownSource, closing] = groups;

      let {markdownFragments, textFragments} = unescapeMarkdown(markdownSource);

      return {
        type: closing.length === 2 ? 'match' : 'pre-match',
        opening,
        closing,
        markdownFragments,
        textFragments,
      };
    },
    compatibilityTester(opening, _content, closing) {
      return (
        testCharacterListConsistency(opening) &&
        testCharacterListConsistency(closing) &&
        !characterListContainsEntity([...opening, ...closing])
      );
    },
  });
}
