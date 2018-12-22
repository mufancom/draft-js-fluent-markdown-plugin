import {Feature} from '../@feature';
import {
  characterListContainsEntityAlike,
  testCharacterListConsistency,
} from '../@utils';

import {createAutoTransformFeature} from './@auto-transform-feature';

const HORIZONTAL_RULE_REGEX = /^(([-_*])\2{2})$/;

export function createHorizontalRuleFeature(): Feature {
  return createAutoTransformFeature({
    matcher(leftText, input, rightText) {
      if (rightText) {
        return undefined;
      }

      let groups = HORIZONTAL_RULE_REGEX.exec(leftText + input);

      if (!groups) {
        return undefined;
      }

      let [, markdownSource] = groups;

      return {
        opening: '',
        closing: '',
        markdownFragments: [markdownSource],
        textFragments: ['\u200b'],
        atomic: {
          type: 'horizontal-rule',
        },
      };
    },
    compatibilityTester(_opening, content, _closing) {
      return (
        testCharacterListConsistency(content) &&
        !characterListContainsEntityAlike(content)
      );
    },
  });
}
