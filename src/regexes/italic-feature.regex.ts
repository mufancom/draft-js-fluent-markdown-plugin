import {NestedRegexes, RegexToolsOptions, Regexes} from 'regex-tools';

import {beginningOrNot, sourceText} from './common';

function italicMarkdown(character: RegExp): NestedRegexes {
  const preceding = beginningOrNot(character);

  const opening: Regexes = {
    name: 'opening',
    regexes: character,
  };

  const text: Regexes = {
    name: 'text-source',
    regexes: sourceText({banned: character}),
  };

  const closing: Regexes = {
    name: 'closing',
    regexes: character,
  };

  return [preceding, opening, text, closing, /$/];
}

const options: RegexToolsOptions[] = [
  {
    name: 'asterisk-italic-markdown',
    operation: 'combine',
    target: '../../src/library/@features/italic-feature.ts',
    regexes: italicMarkdown(/\*/),
  },
  {
    name: 'underscore-italic-markdown',
    operation: 'combine',
    target: '../../src/library/@features/italic-feature.ts',
    regexes: italicMarkdown(/_/),
  },
];

export default options;
