import {ContentBlock, ContentState} from 'draft-js';

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

  type DraftEntityInstance = ReturnType<ContentState['getEntity']>;
}
