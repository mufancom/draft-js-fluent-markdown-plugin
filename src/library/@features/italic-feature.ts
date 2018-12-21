import {DraftInlineStyle} from 'draft-js';
import * as Immutable from 'immutable';

import {Feature} from '../@feature';
import {characterListContainsEntity, unescapeMarkdown} from '../@utils';

import {createAutoConversionFeature} from './@auto-conversion-feature';

const ASTERISK_ITALIC_REGEX = /(?:^|[^*])(\*)((?:\\.|(?!\\|\*).)+)(\*)$/;
const UNDERLINE_ITALIC_REGEX = /(?:^|[^_])(_)((?:\\.|(?!\\|_).)+)(_)$/;

const ITALIC_STYLE: DraftInlineStyle = Immutable.OrderedSet(['ITALIC']);

export function createItalicFeature(): Feature {
  return createAutoConversionFeature({
    style: ITALIC_STYLE,
    matcher(leftText, input) {
      let leftTextWithInput = leftText + input;

      let groups =
        ASTERISK_ITALIC_REGEX.exec(leftTextWithInput) ||
        UNDERLINE_ITALIC_REGEX.exec(leftTextWithInput);

      if (!groups) {
        return undefined;
      }

      let [, opening, markdownSource, closing] = groups;

      let {markdownFragments, textFragments} = unescapeMarkdown(markdownSource);

      return {
        type: 'match',
        opening,
        closing,
        markdownFragments,
        textFragments,
      };
    },
    compatibilityTester(opening, _content, closing) {
      return !characterListContainsEntity([...opening, ...closing]);
    },
  });
}
