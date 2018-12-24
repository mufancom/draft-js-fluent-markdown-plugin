import {NestedRegexes, RegexToolsOptions, Regexes} from 'regex-tools';

import {sourceText} from './common';

const boundary = /`/;

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
  regexes: boundary,
};

const codeMarkdown: NestedRegexes = [opening, text, closing, /$/];

const options: RegexToolsOptions = {
  name: 'code-markdown',
  operation: 'combine',
  target: '../../src/library/@features/code-feature.ts',
  regexes: codeMarkdown,
};

export default options;
