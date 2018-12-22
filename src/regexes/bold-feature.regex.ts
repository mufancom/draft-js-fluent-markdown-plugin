import {NestedRegexes, RegexToolsOptions, Regexes} from 'regex-tools';

import {sourceText} from './common';

function boldMarkdown(character: RegExp): NestedRegexes {
  const boundary: Regexes = {
    regexes: character,
    repeat: '{2}',
  };

  const opening: Regexes = {
    name: 'opening',
    regexes: boundary,
  };

  const text: Regexes = {
    name: 'text-source',
    regexes: sourceText({banned: boundary}),
  };

  const closing: Regexes = {
    name: 'closing',
    regexes: {
      regexes: character,
      // allow pre-match
      repeat: '{1,2}',
    },
  };

  return [opening, text, closing, /$/];
}

const options: RegexToolsOptions[] = [
  {
    name: 'asterisk-bold-markdown',
    operation: 'combine',
    target: '../../src/library/@features/bold-feature.ts',
    regexes: boldMarkdown(/\*/),
    flags: 'm',
  },
  {
    name: 'underscore-bold-markdown',
    operation: 'combine',
    target: '../../src/library/@features/bold-feature.ts',
    regexes: boldMarkdown(/_/),
    flags: 'm',
  },
];

export default options;
