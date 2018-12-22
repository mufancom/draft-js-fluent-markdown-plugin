import {ContentBlock, ContentState} from 'draft-js';
import {ComponentType} from 'react';

declare module 'draft-js' {
  interface DraftBlockRendererComponentProps {
    block: ContentBlock;
    contentState: ContentState;
  }

  interface DraftDecoratorComponentProps {
    contentState: ContentState;
    decoratedText: string;
    entityKey: string | null;
  }

  interface DraftDecorator {
    component: ComponentType<DraftDecoratorComponentProps>;
    props?: object;
    strategy(
      block: ContentBlock,
      callback: (start: number, end: number) => void,
      contentState: ContentState,
    ): void;
  }

  type DraftEntityInstance = ReturnType<ContentState['getEntity']>;
}
