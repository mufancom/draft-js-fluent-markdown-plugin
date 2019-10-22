import 'draft-js/dist/Draft.css';

import {EditorState, convertFromRaw} from 'draft-js';
import Editor from 'draft-js-plugins-editor';
import React, {Component, FC, ReactNode} from 'react';
import ReactDOM from 'react-dom';

import createFluentMarkdownPlugin, {
  FluentMarkdownPluginLinkComponentProps,
} from '../bld/library';

const Link: FC<FluentMarkdownPluginLinkComponentProps> = props => {
  return (
    <a
      href="#"
      onClick={() => {
        let href = props.href;

        if (!href.startsWith('mf+')) {
          window.open(href);
          return;
        }

        let w = '480',
          h = '240',
          size,
          time,
          queryString = href.split('?')[1];

        if (queryString) {
          [size, time] = getQuery(queryString, 'mf').split('t');

          [w, h] = size.split('x');
        }

        let newWindow = window.open(
          href.slice(3),
          '_blank',
          `width=${w},height=${h} ,left=${(window.screen.availWidth -
            Number(w)) /
            2},top=${(window.screen.availHeight - Number(h)) /
            2},toolbar=no,menubar=no,scrollbars=no,resizable=no,location=no`,
        );

        let autoCloseTime = Number(time);

        if (autoCloseTime) {
          setTimeout(() => {
            newWindow!.close();
          }, autoCloseTime);
        }
      }}
    >
      {props.children}
    </a>
  );
};

const PLUGINS = [
  createFluentMarkdownPlugin({
    indent: {tabSize: 4},
    link: {
      component: Link,
      customLinkifyRule: [
        {
          schema: 'mf+http:',
          definition: 'http:',
        },
        {
          schema: 'mf+https:',
          definition: 'https:',
        },
      ],
    },
  }),
];

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
    {
      key: 'neob7',
      text: '',
      type: 'unstyled',
      depth: 0,
      inlineStyleRanges: [],
      entityRanges: [],
    },
    {
      key: 'neob8',
      text: 'Append ")" to next line.  width x height t autoCloseTime(ms)',
      type: 'unstyled',
      depth: 0,
      inlineStyleRanges: [
        {
          offset: 0,
          length: 24,
          style: 'UNDERLINE',
        },
        {
          offset: 26,
          length: 5,
          style: 'CODE',
        },
        {
          offset: 34,
          length: 6,
          style: 'CODE',
        },
        {
          offset: 43,
          length: 17,
          style: 'CODE',
        },
      ],
      entityRanges: [],
    },
    {
      key: 'neob9',
      text: '[makeflow](mf+https://makeflow.com?mf=800x600t2000',
      type: 'unstyled',
      depth: 0,
      inlineStyleRanges: [],
      entityRanges: [],
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

function getQuery(queryString: string, name: string): string {
  let result = queryString.match(
    new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i'),
  );

  return result ? result[2] : '';
}
