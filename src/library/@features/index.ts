import {Feature} from '../@feature';

import {boldFeature} from './bold-feature';
import {codeFeature} from './code-feature';
import {italicFeature} from './italic-feature';
import {strikethroughFeature} from './strikethrough-feature';

export * from './bold-feature';
export * from './italic-feature';
export * from './code-feature';
export * from './strikethrough-feature';

export const INLINE_FEATURES: Feature[] = [
  boldFeature,
  italicFeature,
  strikethroughFeature,
  codeFeature,
];

export const BLOCK_FEATURES: Feature[] = [];
