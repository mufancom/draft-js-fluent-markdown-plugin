import {NestedRegexes, RegexToolsOptions, Regexes} from 'regex-tools';

import {sourceText} from './common';

const opening: Regexes = {
  name: 'opening',
  regexes: /!\[/,
};

const alt: Regexes = {
  name: 'alt-source',
  regexes: sourceText({banned: /\]/, allowEmpty: true}),
};

const src = sourceText({banned: /[\s)]/});

const descriptor = / +\d+[wx]/;

const srcSet: Regexes = {
  name: 'src-set-source',
  regexes: [
    [
      {
        name: 'src-source',
        regexes: src,
      },
      {
        regexes: descriptor,
        repeat: '?',
      },
      {
        regexes: [
          /\s*,\s*/,
          src,
          {
            regexes: descriptor,
            repeat: '?',
          },
        ],
        repeat: '*',
      },
    ],
  ],
  or: true,
};

const closing: Regexes = {
  name: 'closing',
  regexes: [/\]\(/, srcSet, /\)/],
};

const image: NestedRegexes = [opening, alt, closing, /$/];

const options: RegexToolsOptions = {
  name: 'image-markdown',
  operation: 'combine',
  target: '../../src/library/@features/image-feature.ts',
  regexes: image,
  flags: 'm',
};

export default options;
