import {NestedRegexes, RegexToolsOptions} from 'regex-tools';

import {escapedSourceCharacter} from './common';

const markdownSourceCharacter: NestedRegexes = {
  regexes: [escapedSourceCharacter, /[^]/],
  or: true,
};

const options: RegexToolsOptions = {
  name: 'markdown-source-character',
  operation: 'combine',
  target: '../../src/library/@utils/markdown.ts',
  regexes: markdownSourceCharacter,
  flags: 'g',
};

export default options;
