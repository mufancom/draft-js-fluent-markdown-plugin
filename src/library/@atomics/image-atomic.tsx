import {DraftBlockRendererComponentProps} from 'draft-js';
import React, {FunctionComponent} from 'react';

import {AtomicData, AtomicDescriptorEntry} from '../@atomic';

export interface ImageData extends AtomicData {
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

  return ['image', {component: Image}];
}
