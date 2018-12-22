import React from 'react';

import {AtomicDescriptorEntry} from '../@atomic';

export function createHorizontalRuleAtomicComponentEntry(): AtomicDescriptorEntry {
  return ['horizontal-rule', {component: () => <hr />}];
}
