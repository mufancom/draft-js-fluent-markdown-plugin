import detectIndent from 'detect-indent';
import {EditorState, Modifier, SelectionState} from 'draft-js';
import {KeyboardEvent} from 'react';

import {getContentSelectionAmbient} from '../@utils';

const TAB_WHITESPACES_REGEX = /(?:^|\n)([\t ]*)$/;

const SUPPORTED_BLOCK_TYPE_SET = new Set(['code-block']);

export interface TabIndentOptions {
  /**
   * Size of tab rendered, defaults to `8`. Set this value to match the CSS
   * `tab-size` style.
   */
  tabSize?: number;
  /**
   * Number of spaces to insert on tab, defaults to `2`. Set to `0` will insert
   * `\t` instead.
   */
  tabSpaces?: number;
}

export function handleTabIndent(
  editorState: EditorState,
  event: KeyboardEvent,
  {tabSize = 8, tabSpaces = 2}: TabIndentOptions = {},
): EditorState {
  let {
    content,
    selection,
    leftOffset,
    leftBlock,
    leftText,
    rightText,
  } = getContentSelectionAmbient(editorState);

  if (!SUPPORTED_BLOCK_TYPE_SET.has(leftBlock.getType())) {
    return editorState;
  }

  let groups = TAB_WHITESPACES_REGEX.exec(leftText);

  if (!groups) {
    return editorState;
  }

  let [, whitespaces] = groups;

  let indent = detectIndent(leftText + rightText);

  let indentType = indent.type || (tabSpaces ? 'space' : 'tab');
  let actualTabSpaces =
    indentType === 'space' ? indent.amount || tabSpaces : tabSize;

  let currentIndentWidth = Array.from(whitespaces).reduce(addUpIndentWidth, 0);

  if (event.shiftKey) {
    decreaseIndent();
  } else {
    increaseIndent();
  }

  event.preventDefault();

  return editorState;

  function increaseIndent(): void {
    let style = editorState.getCurrentInlineStyle();
    let spacesToInsert: string;

    if (indentType === 'space') {
      let nextWidth =
        actualTabSpaces *
        (Math.floor(currentIndentWidth / actualTabSpaces) + 1);

      spacesToInsert = ''.padEnd(nextWidth - currentIndentWidth);
    } else {
      spacesToInsert = '\t';
    }

    content = Modifier.replaceText(content, selection, spacesToInsert, style);

    editorState = EditorState.push(editorState, content, 'insert-characters');
  }

  function decreaseIndent(): void {
    if (!whitespaces) {
      return;
    }

    let nextWidth =
      actualTabSpaces * (Math.ceil(currentIndentWidth / actualTabSpaces) - 1);

    let accumulatedWidth = 0;
    let removeFromOffset = leftText.length - whitespaces.length;

    for (let character of whitespaces) {
      accumulatedWidth = addUpIndentWidth(accumulatedWidth, character);

      if (accumulatedWidth > nextWidth) {
        break;
      }

      removeFromOffset++;
    }

    let range = selection.merge({
      anchorOffset: removeFromOffset,
      focusOffset: leftOffset,
    }) as SelectionState;

    content = Modifier.removeRange(content, range, 'backward');

    editorState = EditorState.push(editorState, content, 'remove-range');
  }

  function addUpIndentWidth(
    accumulatedWidth: number,
    character: string,
  ): number {
    if (character === '\t') {
      return tabSize * (Math.floor(accumulatedWidth / tabSize) + 1);
    } else {
      return accumulatedWidth + 1;
    }
  }
}
