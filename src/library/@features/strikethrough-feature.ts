import {DraftInlineStyle} from 'draft-js';
import * as Immutable from 'immutable';

import {Feature} from '../@feature';
import {
  characterListContainsEntity,
  testCharacterListConsistency,
  unescapeMarkdown,
} from '../@utils';

import {createAutoTransformFeature} from './@auto-transform-feature';

const STRIKETHROUGH_REGEX = /(?:^|[^~])(~{2})((?:\\.|(?!\\|~{2}).)+)(~{1,2})$/;

const STRIKETHROUGH_STYLE: DraftInlineStyle = Immutable.OrderedSet([
  'STRIKETHROUGH',
]);

export function createStrikethroughFeature(): Feature {
  return createAutoTransformFeature({
    style: STRIKETHROUGH_STYLE,
    matcher(leftText, input) {
      let groups = STRIKETHROUGH_REGEX.exec(leftText + input);

      if (!groups) {
        return undefined;
      }

      let [, opening, markdownSource, closing] = groups;

      let {markdownFragments, textFragments} = unescapeMarkdown(markdownSource);

      return {
        type: closing.length === 2 ? 'match' : 'pre-match',
        opening,
        closing,
        markdownFragments,
        textFragments,
      };
    },
    compatibilityTester(opening, _content, closing) {
      return (
        testCharacterListConsistency(opening) &&
        testCharacterListConsistency(closing) &&
        !characterListContainsEntity([...opening, ...closing])
      );
    },
  });
}
