import {ImageData} from '../@atomics';
import {Feature} from '../@feature';
import {
  characterListContainsEntityAlike,
  testCharacterListConsistency,
  unescapeMarkdown,
} from '../@utils';

import {createAutoTransformFeature} from './@auto-transform-feature';

const IMAGE_REGEX = /* /$image-markdown/ */ /(!\[)((?:(?!\])(?:\\[!"#$%&'()*+,.\/:;<=>?@^_`{}~\[\]\\\-]|(?!\\).|\\(?![!"#$%&'()*+,.\/:;<=>?@^_`{}~\[\]\\\-])))*)(\]\((((?:(?![\s)])(?:\\[!"#$%&'()*+,.\/:;<=>?@^_`{}~\[\]\\\-]|(?!\\).|\\(?![!"#$%&'()*+,.\/:;<=>?@^_`{}~\[\]\\\-])))+)(?: +\d+[wx])?(?:\s*,\s*(?:(?![\s)])(?:\\[!"#$%&'()*+,.\/:;<=>?@^_`{}~\[\]\\\-]|(?!\\).|\\(?![!"#$%&'()*+,.\/:;<=>?@^_`{}~\[\]\\\-])))+(?: +\d+[wx])?)*)\))$/m;

export function createImageFeature(): Feature {
  return createAutoTransformFeature({
    matcher(leftText, input) {
      let groups = IMAGE_REGEX.exec(leftText + input);

      if (!groups) {
        return undefined;
      }

      /* /$image-markdown/ */
      let opening = groups[1];
      let altSource = groups[2];
      let closing = groups[3];
      let srcSetSource = groups[4];
      let srcSource = groups[5];

      let {markdown, text: alt} = unescapeMarkdown(altSource);

      let {text: src} = unescapeMarkdown(srcSource);

      let srcSet: string | undefined;

      if (srcSetSource !== srcSource) {
        ({text: srcSet} = unescapeMarkdown(srcSetSource));
      }

      let atomic: ImageData = {
        type: 'image',
        alt,
        src,
        srcSet,
      };

      return {
        opening,
        closing,
        markdownFragments: [markdown],
        textFragments: ['\u200b'],
        atomic,
      };
    },
    compatibilityTester(opening, content, closing) {
      let list = [...opening, ...content, ...closing];

      return (
        testCharacterListConsistency(list) &&
        !characterListContainsEntityAlike(list)
      );
    },
  });
}
