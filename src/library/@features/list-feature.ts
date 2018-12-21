import {Feature} from '../@feature';
import {
  characterListContainsEntity,
  testCharacterListConsistency,
} from '../@utils';

import {createAutoBlockFeature} from './@auto-block-feature';

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
      };
    },
    compatibilityTester(list) {
      return (
        testCharacterListConsistency(list) && !characterListContainsEntity(list)
      );
    },
  });
}
