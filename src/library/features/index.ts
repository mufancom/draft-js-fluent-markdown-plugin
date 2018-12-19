import {boldFeature} from './bold-feature';
import {codeFeature} from './code-feature';
import {italicFeature} from './italic-feature';
import {strikethroughFeature} from './strikethrough-feature';

export * from './bold-feature';
export * from './italic-feature';
export * from './code-feature';
export * from './strikethrough-feature';

export const INLINE_FEATURES = [
  boldFeature,
  italicFeature,
  strikethroughFeature,
  codeFeature,
];

export const FULL_FEATURES = [
  boldFeature,
  italicFeature,
  strikethroughFeature,
  codeFeature,
];
