import {ComponentType} from 'react';

export interface AtomicData {
  type: string;
}

export interface AtomicDescriptor {
  component: ComponentType;
}

export type AtomicDescriptorEntry = [string, AtomicDescriptor];
