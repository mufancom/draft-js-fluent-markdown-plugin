import {DraftInlineStyle} from 'draft-js';
import {OrderedSet} from 'immutable';

import {unescapeMarkdown} from '../utils';

import {createInlineFeature} from './@inline-feature';

const ASTERISK_ITALIC_REGEX = /(?:^|[^*])(\*)((?:\\.|(?!\\|\*).)+)(\*)$/;
const UNDERLINE_ITALIC_REGEX = /(?:^|[^_])(_)((?:\\.|(?!\\|_).)+)(_)$/;

const ITALIC_STYLE: DraftInlineStyle = OrderedSet(['ITALIC']);

export const italicFeature = createInlineFeature({
  style: ITALIC_STYLE,
  matcher(textBeforeOffset) {
    let groups =
      ASTERISK_ITALIC_REGEX.exec(textBeforeOffset) ||
      UNDERLINE_ITALIC_REGEX.exec(textBeforeOffset);

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
