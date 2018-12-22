import {DraftInlineStyle} from 'draft-js';
import * as Immutable from 'immutable';

import {Feature} from '../@feature';
import {characterListContainsEntityAlike, unescapeMarkdown} from '../@utils';

import {createAutoTransformFeature} from './@auto-transform-feature';

const ASTERISK_ITALIC_REGEX = /* /$asterisk-italic-markdown/ */ /(?:^|(?!\*).)(\*)((?:(?!\*)(?:\\[!"#$%&'()*+,.\/:;<=>?@^_`{}~\[\]\\\-]|(?!\\).|\\(?![!"#$%&'()*+,.\/:;<=>?@^_`{}~\[\]\\\-])))+)(\*)$/m;
const UNDERSCORE_ITALIC_REGEX = /* /$underscore-italic-markdown/ */ /(?:^|(?!_).)(_)((?:(?!_)(?:\\[!"#$%&'()*+,.\/:;<=>?@^_`{}~\[\]\\\-]|(?!\\).|\\(?![!"#$%&'()*+,.\/:;<=>?@^_`{}~\[\]\\\-])))+)(_)$/m;

const ITALIC_STYLE: DraftInlineStyle = Immutable.OrderedSet(['ITALIC']);

export function createItalicFeature(): Feature {
  return createAutoTransformFeature({
    matcher(leftText, input) {
      let leftTextWithInput = leftText + input;

      let groups =
        ASTERISK_ITALIC_REGEX.exec(leftTextWithInput) ||
        UNDERSCORE_ITALIC_REGEX.exec(leftTextWithInput);

      if (!groups) {
        return undefined;
      }

      /* /$asterisk-italic-markdown/ */
      let opening = groups[1];
      let textSource = groups[2];
      let closing = groups[3];

      let {markdownFragments, textFragments} = unescapeMarkdown(textSource);

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
