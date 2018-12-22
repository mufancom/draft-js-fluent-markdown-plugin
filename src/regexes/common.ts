import {Regexes} from 'regex-tools';

export const escapableSourceCharacter = /[!"#$%&'()*+,./:;<=>?@^_`{}~\[\]\\\-]/;

export const escapedSourceCharacter = [/\\/, escapableSourceCharacter];

export const sourceCharacter: Regexes = {
  or: true,
  regexes: [
    escapedSourceCharacter,
    {
      regexes: [
        /(?!\\)./,
        [
          /\\/,
          {
            lookahead: '!',
            regexes: escapableSourceCharacter,
          },
        ],
      ],
      or: true,
    },
  ],
};

export interface SourceTextOptions {
  banned?: Regexes;
  bannedEnding?: Regexes;
  allowEmpty?: boolean;
}

export function sourceText({
  banned,
  bannedEnding,
  allowEmpty = false,
}: SourceTextOptions = {}): Regexes {
  let allowedSourceCharacter: Regexes = banned
    ? [
        {
          lookahead: '!',
          regexes: banned,
        },
        sourceCharacter,
      ]
    : sourceCharacter;

  return bannedEnding
    ? {
        regexes: [
          {
            regexes: allowedSourceCharacter,
            repeat: '*',
          },
          {
            regexes: [
              {
                lookahead: '!',
                regexes: bannedEnding,
              },
              allowedSourceCharacter,
            ],
          },
        ],
        repeat: allowEmpty ? '?' : undefined,
      }
    : {
        regexes: allowedSourceCharacter,
        repeat: allowEmpty ? '*' : '+',
      };
}

export function beginningOrNot(pattern: Regexes): Regexes {
  return {
    regexes: [
      /^/,
      [
        {
          lookahead: '!',
          regexes: pattern,
        },
        /./,
      ],
    ],
    or: true,
  };
}
