import {NestedRegexes, RegexToolsOptions, Regexes} from 'regex-tools';

import {beginningOrNot, sourceText} from './common';

const preceding = beginningOrNot(/!/);

const opening: Regexes = {
  name: 'opening',
  regexes: /\[/,
};

const text: Regexes = {
  name: 'text-source',
  regexes: sourceText({banned: /\]/}),
};

const href: Regexes = {
  name: 'href-source',
  regexes: sourceText({banned: /[\s)]/}),
};

const closing: Regexes = {
  name: 'closing',
  regexes: [/\]\(/, href, /\)/],
};

const link: NestedRegexes = [preceding, opening, text, closing, /$/];

const options: RegexToolsOptions = {
  name: 'link-markdown',
  operation: 'combine',
  target: '../../src/library/@features/link-feature.ts',
  regexes: link,
  flags: 'm',
};

export default options;
