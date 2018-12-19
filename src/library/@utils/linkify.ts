import linkifyIt from 'linkify-it';
import tlds from 'tlds';

export const linkify = linkifyIt().tlds(tlds);
