import {ContentBlock, ContentState, EditorBlock} from 'draft-js';
import {EditorPluginFunctions} from 'draft-js-plugins-editor';
import React, {Component, MouseEvent, ReactNode} from 'react';
import styled from 'styled-components';

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

interface CopyableCodeBlockState {
  copyButtonText: 'Copy' | 'Copied';
}

const Wrapper = styled.div`
  position: relative;

  .copyable-code-block-copy-button {
    position: absolute;
    top: 0px;
    right: 0px;
    border: 0;
    outline: none;
    cursor: pointer;
    background: none transparent;

    &::before {
      content: attr(data-title);
      display: block;
      font-size: 13px;
      color: #222;
    }
  }
`;

const SHOW_COPIED_TIMEOUT = 3000;

class CopyableCodeBlock extends Component<
  CopyableCodeBlockProps,
  CopyableCodeBlockState
> {
  private get content(): string {
    let {
      block,
      blockProps: {getCurrentText},
    } = this.props;

    return getCurrentText(block.getKey());
  }

  private get copyButtonText(): CopyableCodeBlockState['copyButtonText'] {
    return this.state.copyButtonText;
  }

  private set copyButtonText(
    newValue: CopyableCodeBlockState['copyButtonText'],
  ) {
    let currentValue = this.copyButtonText;

    if (currentValue === newValue) {
      return;
    }

    if (newValue === 'Copied') {
      setTimeout(() => {
        this.copyButtonText = 'Copy';
      }, SHOW_COPIED_TIMEOUT);
    }

    this.setState({copyButtonText: newValue});
  }

  state: CopyableCodeBlockState = {copyButtonText: 'Copy'};

  render(): ReactNode {
    let {offsetKey} = this.props;

    return (
      <Wrapper className="copyable-code-block" data-offset-key={offsetKey}>
        <EditorBlock {...this.props} />
        <button
          className="copyable-code-block-copy-button"
          onMouseDown={this.onCopyMouseDown}
          data-title={this.copyButtonText}
        />
      </Wrapper>
    );
  }

  private onCopyMouseDown = (event: MouseEvent<HTMLButtonElement>): void => {
    if (event.button !== 0) {
      return;
    }

    event.preventDefault();

    this.copyContent();
  };

  private copyContent(): void {
    this.copyButtonText = 'Copied';

    navigator.clipboard
      .writeText(this.content)
      .then(() => this.dispatchCopyEvent(ON_COPY_SUCCEED))
      .catch(() => this.dispatchCopyEvent(ON_COPY_FAILED));
  }

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
