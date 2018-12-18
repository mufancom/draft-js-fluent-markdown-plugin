const ESCAPED_ASCII_PUNCTUATION_REGEX = /\\([!"#$%&'()*+,./:;<=>?@^_`{}~\[\]\\-])|[^]/g;

export interface UnescapeMarkdownResult {
  markdown: string[];
  text: string[];
}

export function unescapeMarkdown(source: string): UnescapeMarkdownResult {
  let groups: RegExpExecArray | null;

  let markdown: string[] = [];
  let text: string[] = [];

  // tslint:disable-next-line:no-conditional-assignment
  while ((groups = ESCAPED_ASCII_PUNCTUATION_REGEX.exec(source))) {
    let [markdownCharacter] = groups;

    markdown.push(markdownCharacter);
    text.push(markdownCharacter.slice(-1));
  }

  return {
    markdown,
    text,
  };
}
