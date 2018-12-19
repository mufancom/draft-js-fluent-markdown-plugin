import {DraftInlineStyle} from 'draft-js';
import {OrderedSet} from 'immutable';

import {Feature} from '../@feature';
import {unescapeMarkdown} from '../@utils';

import {createAutoConversionFeature} from './@auto-conversion-feature';

const CODE_REGEX = /(?:^|[^`])(`)((?:\\.|(?![`\\]).)+)(`)$/;

const CODE_STYLE: DraftInlineStyle = OrderedSet(['CODE']);

export function createCodeFeature(): Feature {
  return createAutoConversionFeature({
    style: CODE_STYLE,
    matcher(textBeforeOffset) {
      let groups = CODE_REGEX.exec(textBeforeOffset);

      if (!groups) {
        return undefined;
      }

      let [, opening, markdownSource, closing] = groups;

      let {markdown, text} = unescapeMarkdown(markdownSource);

      return {
        markdown: [opening, ...markdown, closing],
        text: ['', ...text, ''],
      };
    },
    characterCompatibilityTester(metadata) {
      return metadata.getStyle().size === 0;
    },
  });
}
