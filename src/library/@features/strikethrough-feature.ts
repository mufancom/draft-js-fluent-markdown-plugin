import {DraftInlineStyle} from 'draft-js';
import {OrderedSet} from 'immutable';

import {Feature} from '../@feature';
import {unescapeMarkdown} from '../@utils';

import {createInlineFeature} from './@inline-feature';

const STRIKETHROUGH_REGEX = /(?:^|[^~])(~{2})((?:\\.|(?!\\|~{2}).)+)(~{2})$/;

const STRIKETHROUGH_STYLE: DraftInlineStyle = OrderedSet(['STRIKETHROUGH']);

export function createStrikethroughFeature(): Feature {
  return createInlineFeature({
    style: STRIKETHROUGH_STYLE,
    matcher(textBeforeOffset) {
      let groups = STRIKETHROUGH_REGEX.exec(textBeforeOffset);

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
      return !metadata.hasStyle('CODE');
    },
  });
}
