import {NestedRegexes, RegexToolsOptions, Regexes} from 'regex-tools';

import {sourceText} from './common';

const character = /~/;

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

const strikethroughMarkdown: NestedRegexes = [opening, text, closing, /$/];

const options: RegexToolsOptions = {
  name: 'strikethrough-markdown',
  operation: 'combine',
  target: '../../src/library/@features/strikethrough-feature.ts',
  regexes: strikethroughMarkdown,
};

export default options;
