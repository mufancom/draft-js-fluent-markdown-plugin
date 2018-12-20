import {DraftInlineStyle} from 'draft-js';
import * as Immutable from 'immutable';

import {ImageEntityData} from '../@atomics';
import {Feature} from '../@feature';
import {
  characterListContainsEntity,
  testCharacterListConsistency,
  unescapeMarkdown,
} from '../@utils';

import {createAutoConversionFeature} from './@auto-conversion-feature';

const IMAGE_REGEX = /(!\[)((?:\\.|(?!\]).)+)(\]\(((?:\\.|(?![\\)])\S)+?)\))$/;

const IMAGE_STYLE: DraftInlineStyle = Immutable.OrderedSet();

export function createImageFeature(): Feature {
  return createAutoConversionFeature({
    style: IMAGE_STYLE,
    matcher(textBeforeOffset) {
      let groups = IMAGE_REGEX.exec(textBeforeOffset);

      if (!groups) {
        return undefined;
      }

      let [, opening, altMarkdownSource, closing, srcMarkdownSource] = groups;

      let {markdown, text: alt} = unescapeMarkdown(altMarkdownSource);

      let {text: src} = unescapeMarkdown(srcMarkdownSource);

      let data: ImageEntityData = {alt, src};

      return {
        opening,
        closing,
        markdownFragments: [markdown],
        textFragments: ['\u200b'],
        entity: {
          type: 'IMAGE',
          mutability: 'IMMUTABLE',
          data,
        },
        atomic: true,
      };
    },
    compatibilityTester(opening, content, closing) {
      let list = [...opening, ...content, ...closing];

      return (
        testCharacterListConsistency(list) && !characterListContainsEntity(list)
      );
    },
  });
}
