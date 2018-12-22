import {DraftBlockRendererComponentProps} from 'draft-js';
import React, {FunctionComponent} from 'react';

import {AtomicBlockData, AtomicDescriptorEntry} from '../@atomic';

export interface ImageBlockData extends AtomicBlockData {
  alt: string;
  src: string;
}

export function createImageAtomicComponentEntry(): AtomicDescriptorEntry {
  const Image: FunctionComponent<DraftBlockRendererComponentProps> = ({
    block,
  }) => {
    let data = block.getData();

    let alt = data.get('alt');
    let src = data.get('src');

    return <img alt={alt} src={src} />;
  };

  return ['image-block', {component: Image}];
}
