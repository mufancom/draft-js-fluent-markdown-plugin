import {ImageData} from '../@atomics';
import {Feature} from '../@feature';
import {
  characterListContainsEntityAlike,
  testCharacterListConsistency,
  unescapeMarkdown,
} from '../@utils';

import {createAutoTransformFeature} from './@auto-transform-feature';

const IMAGE_REGEX = /(!\[)((?:\\.|(?!\]).)*)(\]\(((?:\\.|(?![\\)])\S)+?)\))$/;

export function createImageFeature(): Feature {
  return createAutoTransformFeature({
    matcher(leftText, input) {
      let groups = IMAGE_REGEX.exec(leftText + input);

      if (!groups) {
        return undefined;
      }

      let [, opening, altMarkdownSource, closing, srcMarkdownSource] = groups;

      let {markdown, text: alt} = unescapeMarkdown(altMarkdownSource);

      let {text: src} = unescapeMarkdown(srcMarkdownSource);

      let atomic: ImageData = {
        type: 'image',
        alt,
        src,
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
