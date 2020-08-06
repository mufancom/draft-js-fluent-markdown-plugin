import {ContentBlock, ContentState, EditorBlock} from 'draft-js';
import {EditorPluginFunctions} from 'draft-js-plugins-editor';
import React, {CSSProperties, Component, MouseEvent, ReactNode} from 'react';

import {BlockDescriptorBuilderEntry} from '../@block';
import {ON_COPY_FAILED, ON_COPY_SUCCEED} from '../constants';

type CopyEvent = typeof ON_COPY_FAILED | typeof ON_COPY_SUCCEED;

interface CopyableCodeBlockProps {
  offsetKey: string;
  block: ContentBlock;
  contentState: ContentState;
  blockProps: CopyableCodeBlockBlockProps;
}

interface CopyableCodeBlockBlockProps {
  getCurrentText(blockKey: string): string;
}

const copyableCodeBlockStyle: CSSProperties = {
  position: 'relative',
};

const copyableCodeBlockCopyButtonStyle: CSSProperties = {
  position: 'absolute',
  top: '8px',
  right: '8px',
  border: 0,
  outline: 'none',
  cursor: 'pointer',
};

class CopyableCodeBlock extends Component<CopyableCodeBlockProps> {
  private get content(): string {
    let {
      block,
      blockProps: {getCurrentText},
    } = this.props;

    return getCurrentText(block.getKey());
  }

  render(): ReactNode {
    let {offsetKey} = this.props;

    return (
      <div
        className="copyable-code-block"
        data-offset-key={offsetKey}
        style={copyableCodeBlockStyle}
      >
        <EditorBlock {...this.props} />
        <button
          className="copyable-code-block-copy-button"
          onMouseDown={this.onCopyMouseDown}
          style={copyableCodeBlockCopyButtonStyle}
        />
      </div>
    );
  }

  private onCopyMouseDown = (event: MouseEvent<HTMLButtonElement>): void => {
    event.preventDefault();

    navigator.clipboard
      .writeText(this.content)
      .then(() => this.dispatchCopyEvent(ON_COPY_SUCCEED))
      .catch(() => this.dispatchCopyEvent(ON_COPY_FAILED));
  };

  private dispatchCopyEvent(event: CopyEvent): void {
    document.dispatchEvent(new CustomEvent(event));
  }
}

export function createCopyableCodeBlockEntry(): BlockDescriptorBuilderEntry {
  return [
    'code-block',
    ({getEditorState}: EditorPluginFunctions) => {
      return {
        component: CopyableCodeBlock,
        props: {
          getCurrentText(blockKey: string): string {
            let editorState = getEditorState();
            let content = editorState.getCurrentContent();
            let block = content.getBlockForKey(blockKey);

            return block.getText();
          },
        },
      };
    },
  ];
}
