import {ComponentType} from 'react';

export interface AtomicDescriptor {
  component: ComponentType;
}

export type AtomicDescriptorEntry = [string, AtomicDescriptor];
