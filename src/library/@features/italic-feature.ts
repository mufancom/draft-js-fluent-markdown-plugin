import {DraftInlineStyle} from 'draft-js';
import * as Immutable from 'immutable';

import {Feature} from '../@feature';
import {
  characterListContainsEntityAlike,
  testCharacterListConsistency,
  unescapeMarkdown,
} from '../@utils';

import {createAutoConversionFeature} from './@auto-conversion-feature';

const ASTERISK_ITALIC_REGEX = /(?:^|[^*])(\*)((?:\\.|(?!\\|\*).)+)(\*)$/;
const UNDERLINE_ITALIC_REGEX = /(?:^|[^_])(_)((?:\\.|(?!\\|_).)+)(_)$/;

const ITALIC_STYLE: DraftInlineStyle = Immutable.OrderedSet(['ITALIC']);

export function createItalicFeature(): Feature {
  return createAutoConversionFeature({
    style: ITALIC_STYLE,
    matcher(textBeforeOffset) {
      let groups =
        ASTERISK_ITALIC_REGEX.exec(textBeforeOffset) ||
        UNDERLINE_ITALIC_REGEX.exec(textBeforeOffset);

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
