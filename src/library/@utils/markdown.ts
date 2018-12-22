const MARKDOWN_SOURCE_CHARACTER_REGEX = /* /$markdown-source-character/ */ /\\[!"#$%&'()*+,.\/:;<=>?@^_`{}~\[\]\\\-]|[^]/g;

export interface UnescapeMarkdownResult {
  markdownFragments: string[];
  markdown: string;
  textFragments: string[];
  text: string;
}

export function unescapeMarkdown(source: string): UnescapeMarkdownResult {
  let groups: RegExpExecArray | null;

  let markdownFragments: string[] = [];
  let textFragments: string[] = [];

  // tslint:disable-next-line:no-conditional-assignment
  while ((groups = MARKDOWN_SOURCE_CHARACTER_REGEX.exec(source))) {
    let [markdownCharacter] = groups;

    markdownFragments.push(markdownCharacter);
    textFragments.push(markdownCharacter.slice(-1));
  }

  return {
    markdownFragments,
    markdown: markdownFragments.join(''),
    textFragments,
    text: textFragments.join(''),
  };
}
