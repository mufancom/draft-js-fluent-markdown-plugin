declare module 'draft-js-plugins-editor' {
  import {EditorProps, EditorState} from 'draft-js';
  import {Component, RefObject} from 'react';

  export interface PluginsEditorProps extends EditorProps {
    plugins?: any[];
    decorators?: any[];
    defaultKeyBindings?: boolean;
    defaultBlockRenderMap?: boolean;
  }

  export class Editor extends Component<PluginsEditorProps> {}

  export default Editor;

  export interface EditorPluginFunctions {
    /**
     * A function returning a list of all the plugins.
     */
    getPlugins(): any[];
    /**
     * A function returning a list of all the props pass into the Editor.
     */
    getProps(): PluginsEditorProps;
    /**
     * A function to update the EditorState.
     */
    setEditorState(editorState: EditorState): void;
    /**
     * A function to get the current EditorState.
     */
    getEditorState(): EditorState;
    /**
     * A function returning of the Editor is set to readOnly.
     */
    getReadOnly(): boolean;
    /**
     * A function which allows to set the Editor to readOnly.
     */
    setReadOnly(readOnly: boolean): void;
    /**
     * A function to get the editor reference.
     */
    getEditorRef(): RefObject<Editor>;
  }
}
