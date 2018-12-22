import {ComponentType} from 'react';

export interface AtomicBlockData {
  type: string;
}

export interface AtomicDescriptor {
  component: ComponentType;
}

export type AtomicDescriptorEntry = [string, AtomicDescriptor];
