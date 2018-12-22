import 'draft-js/dist/Draft.css';

import {EditorState, convertFromRaw} from 'draft-js';
import Editor from 'draft-js-plugins-editor';
import React, {Component, ReactNode} from 'react';
import ReactDOM from 'react-dom';

import createFluentMarkdownPlugin from '../bld/library';

const PLUGINS = [createFluentMarkdownPlugin()];

const DEMO_CONTENT = convertFromRaw({
  blocks: [
    {
      key: 'efs48',
      text: 'Hello, Draft.js',
      type: 'header-one',
      depth: 0,
      inlineStyleRanges: [],
      entityRanges: [],
      data: {},
    },
    {
      key: 'evlc2',
      text:
        'This is a demo for draft-js-fluent-markdown-plugin, have fun typing!',
      type: 'unstyled',
      depth: 0,
      inlineStyleRanges: [
        {
          offset: 10,
          length: 4,
          style: 'BOLD',
        },
        {
          offset: 19,
          length: 31,
          style: 'CODE',
        },
      ],
      entityRanges: [],
      data: {},
    },
  ],
  entityMap: {},
});

interface AppProps {}

interface AppState {
  editorState: EditorState;
}

class App extends Component<AppProps, AppState> {
  state = {
    editorState: EditorState.createWithContent(DEMO_CONTENT),
  };

  render(): ReactNode {
    return (
      <Editor
        editorState={this.state.editorState}
        onChange={this.onEditorChange}
        plugins={PLUGINS}
      />
    );
  }

  private onEditorChange = (editorState: EditorState): void => {
    this.setState({
      editorState,
    });
  };
}

ReactDOM.render(<App />, document.getElementById('app'));
