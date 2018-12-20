import {DraftInlineStyle} from 'draft-js';
import * as Immutable from 'immutable';

import {Feature} from '../@feature';
import {
  characterListContainsEntityAlike,
  testCharacterListConsistency,
  unescapeMarkdown,
} from '../@utils';

import {createAutoConversionFeature} from './@auto-conversion-feature';

const ASTERISK_BOLD_REGEX = /(?:^|[^*])(\*{2})((?:\\.|(?!\\|\*{2}).)+)(\*{2})$/;
const UNDERLINE_BOLD_REGEX = /(?:^|[^_])(_{2})((?:\\.|(?!\\|_{2}).)+)(_{2})$/;

const BOLD_STYLE: DraftInlineStyle = Immutable.OrderedSet(['BOLD']);

export function createBoldFeature(): Feature {
  return createAutoConversionFeature({
    style: BOLD_STYLE,
    matcher(textBeforeOffset) {
      let groups =
        ASTERISK_BOLD_REGEX.exec(textBeforeOffset) ||
        UNDERLINE_BOLD_REGEX.exec(textBeforeOffset);

      if (!groups) {
        return undefined;
      }

      let [, opening, markdownSource, closing] = groups;

      let {markdownFragments, textFragments} = unescapeMarkdown(markdownSource);

      return {
        opening,
        closing,
        markdownFragments,
        textFragments,
      };
    },
    compatibilityTester(opening, _content, closing) {
      let list = [...opening, ...closing];

      return (
        !characterListContainsEntityAlike(list) &&
        testCharacterListConsistency(list)
      );
    },
  });
}
