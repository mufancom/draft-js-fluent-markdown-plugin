import {DraftBlockRendererComponentProps} from 'draft-js';
import React, {FunctionComponent} from 'react';

import {AtomicData, AtomicDescriptorEntry} from '../@atomic';

export interface ImageData extends AtomicData {
  alt: string;
  src: string;
  srcSet: string | undefined;
}

export function createImageAtomicComponentEntry(): AtomicDescriptorEntry {
  const Image: FunctionComponent<DraftBlockRendererComponentProps> = ({
    block,
  }) => {
    let data = block.getData();

    let alt = data.get('alt');
    let src = data.get('src');
    let srcSet = data.get('srcSet');

    return <img alt={alt} src={src} srcSet={srcSet} />;
  };

  return ['image', {component: Image}];
}
