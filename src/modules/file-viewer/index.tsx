import { createSignal, createEffect, onMount } from 'solid-js';
import type { TFileSystemSnapshot, TFileNode, TFileState } from './types';
import { Toolbar } from './toolbar';
import { FileTree } from './file-tree';
import { FileEditor } from './file-editor';
import { listSnapshots } from './storage';

export function FileViewer() {
  const [snapshot, setSnapshot] = createSignal<TFileSystemSnapshot | null>(null);
  const [fileTree, setFileTree] = createSignal<TFileNode[]>([]);
  const [fileState, setFileState] = createSignal<TFileState>({
    currentFile: null,
    isEditing: false,
    content: ''
  });
  const [leftPanelWidth, setLeftPanelWidth] = createSignal(300);
  const [isDragging, setIsDragging] = createSignal(false);

  onMount(async () => {
    try {
      const snapshots = await listSnapshots();
      if (snapshots.length > 0) {
        const latest = snapshots[0];
        setSnapshot(latest.snapshot);
      }
    } catch (error) {
      console.error('Error loading snapshots:', error);
    }
  });

  createEffect(() => {
    const currentSnapshot = snapshot();
    if (currentSnapshot) {
      const tree = buildFileTree(currentSnapshot.files);
      setFileTree(tree);
    }
  });

  function buildFileTree(files: Record<string, string>): TFileNode[] {
    const tree: TFileNode[] = [];
    const folders: Map<string, TFileNode> = new Map();

    function ensureFolder(path: string): TFileNode {
      if (folders.has(path)) {
        return folders.get(path)!;
      }

      const parts = path.split('/');
      const name = parts[parts.length - 1];
      const parentPath = parts.slice(0, -1).join('/');

      const folder: TFileNode = {
        name,
        path,
        type: 'folder',
        children: [],
        expanded: false
      };

      folders.set(path, folder);

      if (parentPath) {
        const parent = ensureFolder(parentPath);
        parent.children!.push(folder);
      } else {
        tree.push(folder);
      }

      return folder;
    }

    Object.keys(files).forEach(filePath => {
      const parts = filePath.split('/');
      const filename = parts[parts.length - 1];
      const folderPath = parts.slice(0, -1).join('/');

      const fileNode: TFileNode = {
        name: filename,
        path: filePath,
        type: 'file',
        content: files[filePath]
      };

      if (folderPath) {
        const folder = ensureFolder(folderPath);
        folder.children!.push(fileNode);
      } else {
        tree.push(fileNode);
      }
    });

    function sortNodes(nodes: TFileNode[]): TFileNode[] {
      return nodes.sort((a, b) => {
        if (a.type !== b.type) {
          return a.type === 'folder' ? -1 : 1;
        }
        return a.name.localeCompare(b.name);
      });
    }

    function sortTreeRecursively(nodes: TFileNode[]): TFileNode[] {
      const sorted = sortNodes(nodes);
      sorted.forEach(node => {
        if (node.children) {
          node.children = sortTreeRecursively(node.children);
        }
      });
      return sorted;
    }

    return sortTreeRecursively(tree);
  }

  function handleImport(importedSnapshot: TFileSystemSnapshot) {
    setSnapshot(importedSnapshot);
    setFileState({
      currentFile: null,
      isEditing: false,
      content: ''
    });
  }

  function handleClear() {
    setSnapshot(null);
    setFileTree([]);
    setFileState({
      currentFile: null,
      isEditing: false,
      content: ''
    });
  }

  function handleFileSelect(path: string) {
    const currentSnapshot = snapshot();
    if (!currentSnapshot) return;

    const content = currentSnapshot.files[path] || '';
    setFileState({
      currentFile: path,
      isEditing: false,
      content
    });
  }

  function handleToggleEdit() {
    setFileState(prev => ({
      ...prev,
      isEditing: !prev.isEditing
    }));
  }

  function handleContentChange(newContent: string) {
    const currentFileState = fileState();
    if (!currentFileState.currentFile || !snapshot()) return;

    setFileState(prev => ({
      ...prev,
      content: newContent
    }));

    setSnapshot(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        files: {
          ...prev.files,
          [currentFileState.currentFile!]: newContent
        }
      };
    });
  }

  function handleMouseDown(e: MouseEvent) {
    setIsDragging(true);
    e.preventDefault();
  }

  function handleMouseMove(e: MouseEvent) {
    if (!isDragging()) return;
    
    const containerRect = document.getElementById('fs-viewer-container')?.getBoundingClientRect();
    if (!containerRect) return;

    const newWidth = Math.max(200, Math.min(600, e.clientX - containerRect.left));
    setLeftPanelWidth(newWidth);
  }

  function handleMouseUp() {
    setIsDragging(false);
  }

  createEffect(() => {
    if (isDragging()) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }
  });

  return (
    <div class="w-full h-screen bg-[#111] text-white flex flex-col font-mono">
      <Toolbar
        onImport={handleImport}
        onClear={handleClear}
        currentSnapshot={snapshot()}
      />
      
      <div id="fs-viewer-container" class="flex-1 flex relative overflow-hidden">
        <div 
          class="flex-shrink-0 h-full"
          style={`width: ${leftPanelWidth()}px`}
        >
          <FileTree
            files={fileTree()}
            currentFile={fileState().currentFile}
            onFileSelect={handleFileSelect}
          />
        </div>
        
        <div
          class="w-1 bg-gray-700 cursor-col-resize hover:bg-gray-600 transition-colors flex-shrink-0"
          onMouseDown={handleMouseDown}
        />
        
        <div class="flex-1 h-full overflow-hidden">
          <FileEditor
            fileState={fileState()}
            onContentChange={handleContentChange}
            onToggleEdit={handleToggleEdit}
          />
        </div>
      </div>
    </div>
  );
}
