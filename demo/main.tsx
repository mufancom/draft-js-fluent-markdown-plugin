import {EditorState} from 'draft-js';
import Editor from 'draft-js-plugins-editor';
import React, {Component, ReactNode} from 'react';
import ReactDOM from 'react-dom';

import {createFluentMarkdownPlugin} from '../bld/library';

const PLUGINS = [createFluentMarkdownPlugin()];

interface AppProps {}

interface AppState {
  editorState: EditorState;
}

class App extends Component<AppProps, AppState> {
  state = {
    editorState: EditorState.createEmpty(),
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
