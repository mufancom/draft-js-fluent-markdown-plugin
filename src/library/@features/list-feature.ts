import {Feature} from '../@feature';
import {
  characterListContainsEntityAlike,
  testCharacterListConsistency,
} from '../@utils';

import {createAutoBlockFeature} from './@auto-block-feature';
import {AUTO_BLOCK_TYPE_BLACKLIST} from './@auto-block-type-balcklist';

const LIST_REGEX = /^(?:([-+*])|(\d+\.)) $/;

export function createListFeature(): Feature {
  return createAutoBlockFeature({
    matcher(leftText, input) {
      let groups = LIST_REGEX.exec(leftText + input);

      if (!groups) {
        return undefined;
      }

      let [, unordered] = groups;

      return {
        type: unordered ? 'unordered-list-item' : 'ordered-list-item',
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
