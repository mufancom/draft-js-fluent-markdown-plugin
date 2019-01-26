import {Feature} from '../@feature';
import {
  characterListContainsEntityAlike,
  testCharacterListConsistency,
} from '../@utils';

import {createAutoBlockFeature} from './@auto-block-feature';
import {AUTO_BLOCK_TYPE_BLACKLIST} from './@auto-block-type-blacklist';

const ITEM_REGEX = /^\[([x ])\] $/i;

export function createCheckableListItemFeature(): Feature {
  return createAutoBlockFeature({
    matcher(input, {leftText, leftBlock}) {
      if (leftBlock.getType() !== 'unordered-list-item') {
        return undefined;
      }

      let groups = ITEM_REGEX.exec(leftText + input);

      if (!groups) {
        return undefined;
      }

      let checked = groups[1] !== ' ';

      return {
        type: 'checkable-list-item',
        data: {checked},
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
