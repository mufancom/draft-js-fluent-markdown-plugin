import {Feature} from '../@feature';
import {
  characterListContainsEntityAlike,
  testCharacterListConsistency,
} from '../@utils';

import {createAutoBlockFeature} from './@auto-block-feature';

const BLOCKQUOTE_REGEX = /^> $/;

export function createBlockquoteFeature(): Feature {
  return createAutoBlockFeature({
    matcher(leftText, input) {
      let groups = BLOCKQUOTE_REGEX.exec(leftText + input);

      if (!groups) {
        return undefined;
      }

      return {
        type: 'blockquote',
      };
    },
    compatibilityTester(list) {
      return (
        testCharacterListConsistency(list) &&
        !characterListContainsEntityAlike(list)
      );
    },
  });
}
