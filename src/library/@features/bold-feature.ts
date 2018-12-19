import {DraftInlineStyle} from 'draft-js';
import {OrderedSet} from 'immutable';

import {Feature} from '../@feature';
import {unescapeMarkdown} from '../@utils';

import {createAutoConversionFeature} from './@auto-conversion-feature';

const ASTERISK_BOLD_REGEX = /(?:^|[^*])(\*{2})((?:\\.|(?!\\|\*{2}).)+)(\*{2})$/;
const UNDERLINE_BOLD_REGEX = /(?:^|[^_])(_{2})((?:\\.|(?!\\|_{2}).)+)(_{2})$/;

const BOLD_STYLE: DraftInlineStyle = OrderedSet(['BOLD']);

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
        markdownFragments: [opening, ...markdownFragments, closing],
        textFragments: ['', ...textFragments, ''],
      };
    },
    characterCompatibilityTester(metadata) {
      return !metadata.hasStyle('CODE');
    },
  });
}
