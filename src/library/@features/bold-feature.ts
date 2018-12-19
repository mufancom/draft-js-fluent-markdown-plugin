import {DraftInlineStyle} from 'draft-js';
import {OrderedSet} from 'immutable';

import {unescapeMarkdown} from '../utils';

import {createInlineFeature} from './@inline-feature';

const ASTERISK_BOLD_REGEX = /(?:^|[^*])(\*{2})((?:\\.|(?!\\|\*{2}).)+)(\*{2})$/;
const UNDERLINE_BOLD_REGEX = /(?:^|[^_])(_{2})((?:\\.|(?!\\|_{2}).)+)(_{2})$/;

const BOLD_STYLE: DraftInlineStyle = OrderedSet(['BOLD']);

export const boldFeature = createInlineFeature({
  style: BOLD_STYLE,
  matcher(textBeforeOffset) {
    let groups =
      ASTERISK_BOLD_REGEX.exec(textBeforeOffset) ||
      UNDERLINE_BOLD_REGEX.exec(textBeforeOffset);

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
