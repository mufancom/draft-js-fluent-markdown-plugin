import {DraftBlockRendererComponentProps} from 'draft-js';
import React, {FunctionComponent} from 'react';

import {AtomicDescriptorEntry} from '../@atomic';
import {getBlockEntityDataAt} from '../@utils';

export interface ImageEntityData {
  alt: string;
  src: string;
}

export function createImageAtomicComponentEntry(): AtomicDescriptorEntry {
  const Image: FunctionComponent<DraftBlockRendererComponentProps> = ({
    block,
    contentState,
  }) => {
    let {alt, src} = getBlockEntityDataAt<ImageEntityData>(
      block,
      0,
      contentState,
    )!;

    return <img alt={alt} src={src} />;
  };

  return ['IMAGE', {component: Image}];
}
