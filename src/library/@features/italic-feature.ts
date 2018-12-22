import {DraftInlineStyle} from 'draft-js';
import * as Immutable from 'immutable';

import {Feature} from '../@feature';
import {characterListContainsEntityAlike, unescapeMarkdown} from '../@utils';

import {createAutoTransformFeature} from './@auto-transform-feature';

const ASTERISK_ITALIC_REGEX = /(?:^|[^*])(\*)((?:\\.|(?!\\|\*).)+)(\*)$/;
const UNDERLINE_ITALIC_REGEX = /(?:^|[^_])(_)((?:\\.|(?!\\|_).)+)(_)$/;

const ITALIC_STYLE: DraftInlineStyle = Immutable.OrderedSet(['ITALIC']);

export function createItalicFeature(): Feature {
  return createAutoTransformFeature({
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
        opening,
        closing,
        markdownFragments,
        textFragments,
        style: ITALIC_STYLE,
      };
    },
    compatibilityTester(opening, _content, closing) {
      return !characterListContainsEntityAlike([...opening, ...closing]);
    },
  });
}
