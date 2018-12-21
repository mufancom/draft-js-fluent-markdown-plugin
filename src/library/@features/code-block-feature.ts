import {Feature} from '../@feature';
import {
  characterListContainsEntity,
  testCharacterListConsistency,
} from '../@utils';

import {createAutoBlockFeature} from './@auto-block-feature';

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
      };
    },
    compatibilityTester(list) {
      return (
        testCharacterListConsistency(list) && !characterListContainsEntity(list)
      );
    },
  });
}
