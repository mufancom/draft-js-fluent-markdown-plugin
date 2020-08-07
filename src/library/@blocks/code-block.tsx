import {ContentBlock, EditorBlock} from 'draft-js';
import React, {Component, MouseEvent, ReactNode} from 'react';

import {BlockDescriptorBuilderEntry} from '../@block';
import {
  CODE_BLOCK_COPIED_EVENT_NAME,
  CODE_BLOCK_COPY_ERROR_EVENT_NAME,
} from '../constants';

interface CodeBlockProps {
  offsetKey: string;
  block: ContentBlock;
  blockProps: CodeBlockBlockProps;
}

interface CodeBlockBlockProps {}

interface CodeBlockState {
  copied: boolean;
}

const COPIED_TEXT_TIMEOUT = 1000;

class CodeBlock extends Component<CodeBlockProps, CodeBlockState> {
  private copiedResetTimer: number | undefined;

  private get content(): string {
    let {block} = this.props;

    return block.getText();
  }

  state = {copied: false};

  render(): ReactNode {
    let {offsetKey} = this.props;
    let {copied} = this.state;

    let classNames = ['code-block'];

    if (copied) {
      classNames.push('code-block-copied');
    }

    return (
      <div className={classNames.join(' ')} data-offset-key={offsetKey}>
        <EditorBlock {...this.props} />
        <div className="code-block-copy-button-wrapper" contentEditable={false}>
          <button
            className="code-block-copy-button"
            disabled={copied}
            onClick={this.onCopyButtonClick}
          />
        </div>
      </div>
    );
  }

  private onCopyButtonClick = (event: MouseEvent<HTMLButtonElement>): void => {
    event.stopPropagation();

    this.copyContent();
  };

  private copyContent(): void {
    navigator.clipboard
      .writeText(this.content)
      .then(() => {
        this.setCopied();
        this.dispatchCustomEvent(CODE_BLOCK_COPIED_EVENT_NAME);
      })
      .catch(() => this.dispatchCustomEvent(CODE_BLOCK_COPY_ERROR_EVENT_NAME));
  }

  private setCopied(): void {
    this.setState({...this.state, copied: true});

    clearTimeout(this.copiedResetTimer);

    this.copiedResetTimer = setTimeout(() => {
      this.setState({...this.state, copied: false});
    }, COPIED_TEXT_TIMEOUT);
  }

  private dispatchCustomEvent(name: string): void {
    document.dispatchEvent(new CustomEvent(name));
  }
}

export function createCodeBlockEntry(): BlockDescriptorBuilderEntry {
  return [
    'code-block',
    () => {
      return {
        component: CodeBlock,
      };
    },
  ];
}
