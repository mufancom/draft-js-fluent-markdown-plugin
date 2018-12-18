import {boldFeature} from './bold-feature';
import {codeFeature} from './code-feature';
import {italicFeature} from './italic-feature';

export * from './bold-feature';
export * from './italic-feature';
export * from './code-feature';

export const INLINE_FEATURES = [boldFeature, italicFeature, codeFeature];

export const FULL_FEATURES = [boldFeature, italicFeature, codeFeature];
