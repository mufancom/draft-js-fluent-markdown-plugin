import {Feature} from '../@feature';
import {
  characterListContainsEntityAlike,
  testCharacterListConsistency,
} from '../@utils';

import {createAutoBlockFeature} from './@auto-block-feature';
import {AUTO_BLOCK_TYPE_BLACKLIST} from './@auto-block-type-blacklist';

const BLOCKQUOTE_REGEX = /^> $/;

export function createBlockquoteFeature(): Feature {
  return createAutoBlockFeature({
    matcher(input, {leftText}) {
      let groups = BLOCKQUOTE_REGEX.exec(leftText + input);

      if (!groups) {
        return undefined;
      }

      return {
        type: 'blockquote',
        autoBlockTypeBlacklist: AUTO_BLOCK_TYPE_BLACKLIST,
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
