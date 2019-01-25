import {ContentBlock, ContentState, EditorBlock, EditorState} from 'draft-js';
import {EditorPluginFunctions} from 'draft-js-plugins-editor';
import React, {Component, ReactNode} from 'react';

const CHECKBOX_LIST_ITEM = 'checkbox-list-item';
const TRANSLATE_SIZE = '1.5em';

interface CheckboxListItemProps {
  offsetKey: string;
  block: ContentBlock;
  blockProps: CheckboxListItemBlockProps;
}

interface CheckboxListItemBlockProps {
  checked: boolean;
  onChangeChecked(): void;
}

class CheckboxListItem extends Component<CheckboxListItemProps> {
  render(): ReactNode {
    let {
      offsetKey,
      blockProps: {checked, onChangeChecked},
    } = this.props;

    return (
      <div
        style={{transform: `translateX(-${TRANSLATE_SIZE})`}}
        data-offset-key={offsetKey}
      >
        <div style={{position: 'absolute', zIndex: 1}} contentEditable={false}>
          <input type="checkbox" checked={checked} onChange={onChangeChecked} />
        </div>
        <div style={{paddingLeft: TRANSLATE_SIZE}}>
          <EditorBlock {...this.props} />
        </div>
      </div>
    );
  }
}

export const CheckboxListItemRender = {
  [CHECKBOX_LIST_ITEM]: {
    element: 'li',
    wrapper: <ul className="public-DraftStyleDefault-ul" />,
  },
};

export const CheckboxListItemProvider = {
  type: CHECKBOX_LIST_ITEM,
  provider: (
    block: ContentBlock,
    {getEditorState, setEditorState}: EditorPluginFunctions,
  ): unknown => {
    let editorState = getEditorState();

    let data = block.getData();
    let checked = data.get('checked');

    let props: CheckboxListItemBlockProps = {
      onChangeChecked: (): void => {
        let content = editorState.getCurrentContent();
        let selection = editorState.getSelection();

        let updatedBlock = block.mergeIn(['data'], {
          checked: !checked,
        }) as ContentBlock;

        let blockMap = content
          .getBlockMap()
          .merge({[block.getKey()]: updatedBlock});

        setEditorState(
          EditorState.push(
            editorState,
            content.merge({
              selectionAfter: selection,
              blockMap,
            }) as ContentState,
            'change-block-data',
          ),
        );
      },
      checked,
    };

    return {
      component: CheckboxListItem,
      props,
    };
  },
};
