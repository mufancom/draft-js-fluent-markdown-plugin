import {DraftInlineStyle} from 'draft-js';
import * as Immutable from 'immutable';

import {Feature} from '../@feature';
import {
  characterListContainsEntity,
  testCharacterListConsistency,
  unescapeMarkdown,
} from '../@utils';

import {createAutoTransformFeature} from './@auto-transform-feature';

const CODE_REGEX = /(?:^|[^`])(`)((?:\\.|(?![`\\]).)+)(`)$/;

const CODE_STYLE: DraftInlineStyle = Immutable.OrderedSet(['CODE']);

export function createCodeFeature(): Feature {
  return createAutoTransformFeature({
    style: CODE_STYLE,
    matcher(leftText, input) {
      let groups = CODE_REGEX.exec(leftText + input);

      if (!groups) {
        return undefined;
      }

      let [, opening, markdownSource, closing] = groups;

      let {markdownFragments, textFragments} = unescapeMarkdown(markdownSource);

      return {
        opening,
        closing,
        markdownFragments,
        textFragments,
        entity: {
          type: 'CODE',
          mutability: 'MUTABLE',
        },
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
