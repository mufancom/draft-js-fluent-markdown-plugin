import {EditorPluginFunctions} from 'draft-js-plugins-editor';
import {ComponentType} from 'react';

export interface BlockData {
  type: string;
}

export interface BlockDescriptor {
  component: ComponentType;
  props?: object;
}

export type BlockDescriptorBuilder = (
  pluginFunctions: EditorPluginFunctions,
) => BlockDescriptor;

export type BlockDescriptorBuilderEntry = [string, BlockDescriptorBuilder];
