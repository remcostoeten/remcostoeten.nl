import { createSignal, For } from 'solid-js';
import type { TFileNode } from './types';

type TProps = {
  files: TFileNode[];
  currentFile: string | null;
  onFileSelect: (path: string) => void;
};

export function FileTree(props: TProps) {
  const [expandedFolders, setExpandedFolders] = createSignal<Set<string>>(new Set());

  function toggleFolder(path: string) {
    const expanded = expandedFolders();
    const newExpanded = new Set(expanded);
    
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    
    setExpandedFolders(newExpanded);
  }

  function isExpanded(path: string): boolean {
    return expandedFolders().has(path);
  }

  function getFileIcon(filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'tsx': case 'jsx': return '⚛️';
      case 'ts': case 'js': return '📄';
      case 'css': return '🎨';
      case 'json': return '📋';
      case 'md': return '📝';
      case 'png': case 'jpg': case 'jpeg': case 'gif': case 'svg': return '🖼️';
      default: return '📄';
    }
  }

  function renderFileNode(node: TFileNode, depth: number = 0) {
    const paddingLeft = `${depth * 1.5}rem`;
    
    if (node.type === 'folder') {
      const expanded = isExpanded(node.path);
      
      return (
        <div>
          <div
            class="flex items-center gap-2 py-1 px-2 hover:bg-gray-700 cursor-pointer transition-colors"
            style={`padding-left: ${paddingLeft}`}
            onClick={() => toggleFolder(node.path)}
          >
            <span class="text-gray-400 text-xs w-4 text-center">
              {expanded ? '▼' : '▶'}
            </span>
            <span class="text-blue-400">📁</span>
            <span class="text-gray-300 text-sm">{node.name}</span>
          </div>
          
          {expanded && node.children && (
            <div>
              <For each={node.children}>
                {(child) => renderFileNode(child, depth + 1)}
              </For>
            </div>
          )}
        </div>
      );
    }

    return (
      <div
        class={`flex items-center gap-2 py-1 px-2 hover:bg-gray-700 cursor-pointer transition-colors ${
          props.currentFile === node.path ? 'bg-blue-600' : ''
        }`}
        style={`padding-left: ${paddingLeft}`}
        onClick={() => props.onFileSelect(node.path)}
      >
        <span class="text-gray-400 text-xs w-4 text-center"></span>
        <span class="text-sm">{getFileIcon(node.name)}</span>
        <span class="text-gray-300 text-sm truncate">{node.name}</span>
      </div>
    );
  }

  return (
    <div class="bg-[#1a1a1a] border-r border-gray-700 h-full overflow-y-auto">
      <div class="p-3 border-b border-gray-700">
        <h3 class="text-gray-300 text-sm font-medium">Explorer</h3>
      </div>
      <div class="py-2">
        <For each={props.files}>
          {(node) => renderFileNode(node)}
        </For>
      </div>
    </div>
  );
}
