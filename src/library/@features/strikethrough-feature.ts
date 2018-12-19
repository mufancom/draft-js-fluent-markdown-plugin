import {DraftInlineStyle} from 'draft-js';
import {OrderedSet} from 'immutable';

import {Feature} from '../@feature';
import {unescapeMarkdown} from '../@utils';

import {createAutoConversionFeature} from './@auto-conversion-feature';

const STRIKETHROUGH_REGEX = /(?:^|[^~])(~{2})((?:\\.|(?!\\|~{2}).)+)(~{2})$/;

const STRIKETHROUGH_STYLE: DraftInlineStyle = OrderedSet(['STRIKETHROUGH']);

export function createStrikethroughFeature(): Feature {
  return createAutoConversionFeature({
    style: STRIKETHROUGH_STYLE,
    matcher(textBeforeOffset) {
      let groups = STRIKETHROUGH_REGEX.exec(textBeforeOffset);

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
