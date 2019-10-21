import linkifyIt, {Rule} from 'linkify-it';
import tlds from 'tlds';

export interface CustomLinkifyRule {
  schema: string;
  definition: Rule;
}

export const linkify = (rules?: CustomLinkifyRule[]) => {
  let linkify = linkifyIt().tlds(tlds);

  if (rules) {
    for (let {schema, definition} of rules) {
      linkify.add(schema, definition);
    }
  }

  return linkify;
};
