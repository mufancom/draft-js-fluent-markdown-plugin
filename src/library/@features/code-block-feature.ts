import {Feature} from '../@feature';
import {
  characterListContainsEntityAlike,
  testCharacterListConsistency,
} from '../@utils';

import {createAutoBlockFeature} from './@auto-block-feature';
import {AUTO_BLOCK_TYPE_BLACKLIST} from './@auto-block-type-balcklist';

const CODE_BLOCK_REGEX = /^`{3}$/;

export function createCodeBlockFeature(): Feature {
  return createAutoBlockFeature({
    matcher(leftText, input) {
      let groups = CODE_BLOCK_REGEX.exec(leftText + input);

      if (!groups) {
        return undefined;
      }

      return {
        type: 'code-block',
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
