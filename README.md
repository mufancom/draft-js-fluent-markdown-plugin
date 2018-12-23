[![NPM Package](https://badge.fury.io/js/draft-js-fluent-markdown-plugin.svg)](https://www.npmjs.com/package/draft-js-fluent-markdown-plugin)
[![Build Status](https://travis-ci.org/makeflow/draft-js-fluent-markdown-plugin.svg?branch=master)](https://travis-ci.org/makeflow/draft-js-fluent-markdown-plugin)

# Draft.js Fluent Markdown Plugin

Just another Draft.js markdown plugin. Online [DEMO](https://makeflow.github.io/draft-js-fluent-markdown-plugin/).

![fluent-markdown](https://user-images.githubusercontent.com/970430/50377868-5d182000-0660-11e9-9535-4636e6e2908d.gif)

## Features

- Common inline features like **bold**, _italic_, ~~strikethrough~~, `code`, [link](https://github.com/makeflow) and plain link https://github.com/vilic; and block features like ordered or unordered list, image block, code block, blockquote and horizontal rule.
- Carefully handled undo/redo stack, it always pushes the input before performing markdown transform.
- Reasonable character escaping support, you can safely type `**text\***` and get **text\*** without being surprised.

## Install

```sh
yarn add draft-js-fluent-markdown-plugin
```

## Usage

```tsx
import createFluentMarkdownPlugin from 'draft-js-fluent-markdown-plugin';

const PLUGINS = [createFluentMarkdownPlugin()];

<Editor
  editorState={...}
  onChange={...}
  plugins={PLUGINS}
/>
```

## License

MIT License.
