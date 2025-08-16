import { createSignal, createEffect } from 'solid-js';
import type { TFileState } from './types';

type TProps = {
  fileState: TFileState;
  onContentChange: (content: string) => void;
  onToggleEdit: () => void;
};

export function FileEditor(props: TProps) {
  const [localContent, setLocalContent] = createSignal(props.fileState.content);

  createEffect(() => {
    setLocalContent(props.fileState.content);
  });

  function handleContentChange(e: Event) {
    const target = e.target as HTMLTextAreaElement;
    const content = target.value;
    setLocalContent(content);
    props.onContentChange(content);
  }

  function getLanguageFromFilename(filename: string): string {
    if (!filename) return 'text';
    const ext = filename.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'tsx': return 'typescript';
      case 'ts': return 'typescript';
      case 'jsx': return 'javascript';
      case 'js': return 'javascript';
      case 'css': return 'css';
      case 'json': return 'json';
      case 'md': return 'markdown';
      default: return 'text';
    }
  }

  function getFileExtension(filename: string): string {
    return filename ? filename.split('.').pop()?.toLowerCase() || '' : '';
  }

  function copyToClipboard() {
    navigator.clipboard.writeText(localContent()).then(() => {
      alert('Content copied to clipboard!');
    });
  }

  if (!props.fileState.currentFile) {
    return (
      <div class="bg-[#111] h-full flex items-center justify-center">
        <div class="text-center text-gray-500">
          <div class="text-4xl mb-4">📁</div>
          <div class="text-lg">No file selected</div>
          <div class="text-sm mt-2">Select a file from the tree to view its contents</div>
        </div>
      </div>
    );
  }

  return (
    <div class="bg-[#111] h-full flex flex-col">
      <div class="bg-[#1a1a1a] border-b border-gray-700 p-3 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="flex items-center gap-2">
            <span class="text-blue-400">📄</span>
            <span class="text-gray-300 text-sm font-medium">
              {props.fileState.currentFile.split('/').pop()}
            </span>
            <span class="text-gray-500 text-xs uppercase">
              {getFileExtension(props.fileState.currentFile)}
            </span>
          </div>
          <div class="text-xs text-gray-500">
            {getLanguageFromFilename(props.fileState.currentFile)}
          </div>
        </div>
        
        <div class="flex items-center gap-2">
          <button
            onClick={copyToClipboard}
            class="bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded text-xs transition-colors"
          >
            Copy
          </button>
          <button
            onClick={props.onToggleEdit}
            class={`px-3 py-1 rounded text-xs transition-colors ${
              props.fileState.isEditing
                ? 'bg-orange-600 hover:bg-orange-700'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {props.fileState.isEditing ? 'View' : 'Edit'}
          </button>
        </div>
      </div>

      <div class="flex-1 overflow-hidden">
        {props.fileState.isEditing ? (
          <textarea
            value={localContent()}
            onInput={handleContentChange}
            class="w-full h-full bg-[#111] text-gray-300 font-mono text-sm p-4 border-none outline-none resize-none"
            style="tab-size: 2;"
            spellcheck={false}
          />
        ) : (
          <pre class="w-full h-full bg-[#111] text-gray-300 font-mono text-sm p-4 overflow-auto whitespace-pre-wrap">
            <code>{localContent()}</code>
          </pre>
        )}
      </div>

      <div class="bg-[#1a1a1a] border-t border-gray-700 px-4 py-2 flex items-center justify-between text-xs text-gray-500">
        <div class="flex items-center gap-4">
          <span>Lines: {localContent().split('\n').length}</span>
          <span>Characters: {localContent().length}</span>
        </div>
        <div class="flex items-center gap-2">
          {props.fileState.isEditing && (
            <span class="text-orange-400">● Modified</span>
          )}
          <span>{getLanguageFromFilename(props.fileState.currentFile)}</span>
        </div>
      </div>
    </div>
  );
}
