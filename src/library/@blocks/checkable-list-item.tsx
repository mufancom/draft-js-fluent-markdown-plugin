import {
  ContentBlock,
  ContentState,
  EditorBlock,
  EditorState,
  Modifier,
  SelectionState,
} from 'draft-js';
import {EditorPluginFunctions} from 'draft-js-plugins-editor';
import React, {Component, MouseEvent, ReactNode} from 'react';

import {BlockDescriptorBuilderEntry} from '../@block';

interface CheckableListItemProps {
  offsetKey: string;
  block: ContentBlock;
  blockProps: CheckableListItemBlockProps;
}

interface CheckableListItemBlockProps {
  readOnly: boolean;
  onToggle(block: ContentBlock): void;
}

class CheckableListItem extends Component<CheckableListItemProps> {
  render(): ReactNode {
    let {
      offsetKey,
      block,
      blockProps: {readOnly},
    } = this.props;

    let checked = !!block.getData().get('checked');

    return (
      <div className="checkable-list-item" data-offset-key={offsetKey}>
        <div className="checkable-list-item-checkbox" contentEditable={false}>
          <input
            type="checkbox"
            checked={checked}
            disabled={readOnly}
            onChange={this.onInputChange}
            onMouseDown={this.onMouseDown}
          />
        </div>
        <div className="checkable-list-item-content">
          <EditorBlock {...this.props} />
        </div>
      </div>
    );
  }

  private onInputChange = (): void => {
    let {
      block,
      blockProps: {onToggle},
    } = this.props;

    onToggle(block);
  };

  private onMouseDown = (event: MouseEvent<HTMLDivElement>): void => {
    event.preventDefault();
  };
}

export const checkableListItemRenderEntry = [
  'checkable-list-item',
  {
    element: 'li',
    wrapper: <ul className="public-DraftStyleDefault-ul checkable-list" />,
  },
];

export function createCheckableListItemEntry(): BlockDescriptorBuilderEntry {
  return [
    'checkable-list-item',
    ({getEditorState, setEditorState, getReadOnly}: EditorPluginFunctions) => {
      return {
        component: CheckableListItem,
        props: {
          readOnly: getReadOnly(),
          onToggle(block: ContentBlock) {
            let editorState = getEditorState();

            let content = editorState.getCurrentContent();
            let selection = editorState.getSelection();

            let blockData = block.getData();

            blockData = blockData.merge({
              checked: !blockData.get('checked'),
            });

            let range = SelectionState.createEmpty(block.getKey());

            content = Modifier.setBlockData(content, range, blockData).merge({
              selectionAfter: selection,
            }) as ContentState;

            setEditorState(
              EditorState.push(editorState, content, 'change-block-data'),
            );
          },
        },
      };
    },
  ];
}
