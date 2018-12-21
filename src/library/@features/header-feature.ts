import {Feature} from '../@feature';
import {
  characterListContainsEntity,
  testCharacterListConsistency,
} from '../@utils';

import {createAutoBlockFeature} from './@auto-block-feature';

const HEADER_REGEX = /^(#{1,6}) $/;

const HEADER_TYPES = [
  'header-one',
  'header-two',
  'header-three',
  'header-four',
  'header-five',
  'header-six',
];

export function createHeaderFeature(): Feature {
  return createAutoBlockFeature({
    matcher(leftText, input) {
      let groups = HEADER_REGEX.exec(leftText + input);

      if (!groups) {
        return undefined;
      }

      let [, hashes] = groups;

      let type = HEADER_TYPES[hashes.length - 1];

      return {
        type,
      };
    },
    compatibilityTester(list) {
      return (
        testCharacterListConsistency(list) && !characterListContainsEntity(list)
      );
    },
  });
}
