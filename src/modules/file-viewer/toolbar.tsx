import { createSignal } from 'solid-js';
import type { TFileSystemSnapshot, TDrizzleSchema, TCodeGenType } from './types';
import { getAllSchemas, generateSolidStartCode } from './drizzle-parser';
import { saveSnapshot, clearAllSnapshots } from './storage';

type TProps = {
  onImport: (snapshot: TFileSystemSnapshot) => void;
  onClear: () => void;
  currentSnapshot: TFileSystemSnapshot | null;
};

type TCmdOptions = {
  root: string;
  includeDirs: string;
  excludeDirs: string;
  maxDepth: string;
  includeExts: string;
  excludeExts: string;
  followSymlinks: boolean;
};

export function Toolbar(props: TProps) {
  const [isGenerating, setIsGenerating] = createSignal(false);
  const [selectedSchema, setSelectedSchema] = createSignal<string>('');
  const [selectedCodeType, setSelectedCodeType] = createSignal<TCodeGenType>('server-functions');
  const [generatedCode, setGeneratedCode] = createSignal<string>('');
  const [showCodeModal, setShowCodeModal] = createSignal(false);

  const [showCmdModal, setShowCmdModal] = createSignal(false);
  const [cmd, setCmd] = createSignal<string>('');
  const [cmdOptions, setCmdOptions] = createSignal<TCmdOptions>({
    root: '.',
    includeDirs: '',
    excludeDirs: 'node_modules,.git,.vercel,.vinxi,dist,build,.next',
    maxDepth: '',
    includeExts: 'ts,tsx,js,jsx,json,md,css',
    excludeExts: '',
    followSymlinks: false
  });

  function handleFileImport(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const snapshot = JSON.parse(content) as TFileSystemSnapshot;
        props.onImport(snapshot);
      } catch (error) {
        console.error('Error parsing JSON:', error);
        alert('Error parsing JSON file');
      }
    };
    reader.readAsText(file);
    input.value = '';
  }

  function handleExport() {
    if (!props.currentSnapshot) return;

    const dataStr = JSON.stringify(props.currentSnapshot, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `${props.currentSnapshot.meta.projectName}-snapshot.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  }

  async function handleSave() {
    if (!props.currentSnapshot) return;
    
    try {
      await saveSnapshot(props.currentSnapshot);
      alert('Snapshot saved successfully!');
    } catch (error) {
      console.error('Error saving snapshot:', error);
      alert('Error saving snapshot');
    }
  }

  async function handleClearAll() {
    if (!confirm('Are you sure you want to clear all data? This cannot be undone.')) return;
    
    try {
      await clearAllSnapshots();
      props.onClear();
      alert('All data cleared successfully!');
    } catch (error) {
      console.error('Error clearing data:', error);
      alert('Error clearing data');
    }
  }

  function handleGenerateCode() {
    if (!props.currentSnapshot || !selectedSchema()) return;

    setIsGenerating(true);
    
    try {
      const schemas = getAllSchemas(props.currentSnapshot);
      const schema = schemas.find(s => s.tableName === selectedSchema());
      
      if (schema) {
        const code = generateSolidStartCode(schema, selectedCodeType());
        setGeneratedCode(code);
        setShowCodeModal(true);
      }
    } catch (error) {
      console.error('Error generating code:', error);
      alert('Error generating code');
    } finally {
      setIsGenerating(false);
    }
  }

  function copyCodeToClipboard() {
    navigator.clipboard.writeText(generatedCode()).then(() => {
      alert('Code copied to clipboard!');
    });
  }

  function getSchemas(): TDrizzleSchema[] {
    if (!props.currentSnapshot) return [];
    return getAllSchemas(props.currentSnapshot);
  }

  function setOption<K extends keyof TCmdOptions>(key: K, value: TCmdOptions[K]) {
    const prev = cmdOptions();
    setCmdOptions({ ...prev, [key]: value });
  }

  function toList(input: string): string[] {
    return input.split(',').map(s => s.trim()).filter(Boolean);
  }

  function buildFindPredicates(options: TCmdOptions): string {
    const includes = toList(options.includeDirs);
    const excludes = toList(options.excludeDirs);
    const includeExts = toList(options.includeExts).map(e => e.replace(/^\./, ''));
    const excludeExts = toList(options.excludeExts).map(e => e.replace(/^\./, ''));

    const depth = options.maxDepth ? `-maxdepth ${options.maxDepth}` : '';
    const follow = options.followSymlinks ? '-L' : '';

    const prunes = excludes.length > 0
      ? `\( ${excludes.map(d => `-path "*/${d}/*"`).join(' -o ')} \) -prune -o`
      : '';

    const dirScope = includes.length > 0
      ? `\( ${includes.map(d => `-path "*/${d}/*"`).join(' -o ')} \) -type f`
      : `-type f`;

    const includeName = includeExts.length > 0
      ? `\( ${includeExts.map(e => `-name "*.${e}"`).join(' -o ')} \)`
      : '';

    const excludeName = excludeExts.length > 0
      ? excludeExts.map(e => `! -name "*.${e}"`).join(' ')
      : '';

    const parts = [follow, depth, prunes, dirScope, includeName, excludeName].filter(Boolean).join(' ');
    return parts;
  }

  function buildCommand() {
    const options = cmdOptions();
    const root = options.root || '.';
    const predicates = buildFindPredicates(options);
    const header = `ROOT=${JSON.stringify(root)}; `;
    const findCmd = `find "$ROOT" ${predicates} -print0`;
    const chunk = `xargs -0 -I{} sh -c 'p="${'$'}{1#./}"; jq -n --arg p "$p" --rawfile c "$1" "{($p): $c}"' _ {}`;
    const reduce = `jq -s 'reduce .[] as $o ({}; . * $o)'`;
    const clip = `\( command -v wl-copy >/dev/null 2>&1 \) && wl-copy || \( command -v xclip >/dev/null 2>&1 \) && xclip -selection clipboard || cat`;
    const full = `${header}${findCmd} | ${chunk} | ${reduce} | ${clip}`;
    setCmd(full);
    setShowCmdModal(true);
  }

  function copyCmdToClipboard() {
    navigator.clipboard.writeText(cmd()).then(() => {
      alert('Command copied to clipboard!');
    });
  }

  return (
    <>
      <div class="bg-[#1a1a1a] border-b border-gray-700 p-3 flex items-center gap-3 text-sm">
        <label class="bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded cursor-pointer transition-colors">
          Import JSON
          <input
            type="file"
            accept=".json"
            onChange={handleFileImport}
            class="hidden"
          />
        </label>
        
        <button
          onClick={handleExport}
          disabled={!props.currentSnapshot}
          class="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed px-3 py-1.5 rounded transition-colors"
        >
          Export
        </button>
        
        <button
          onClick={handleSave}
          disabled={!props.currentSnapshot}
          class="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed px-3 py-1.5 rounded transition-colors"
        >
          Save
        </button>

        <button
          onClick={buildCommand}
          class="bg-gray-700 hover:bg-gray-600 px-3 py-1.5 rounded transition-colors"
        >
          Generate Command
        </button>
        
        <div class="flex-1" />
        
        <select
          value={selectedSchema()}
          onChange={(e) => setSelectedSchema(e.currentTarget.value)}
          disabled={getSchemas().length === 0}
          class="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white disabled:opacity-50"
        >
          <option value="">Select Table</option>
          {getSchemas().map(schema => (
            <option value={schema.tableName}>{schema.tableName}</option>
          ))}
        </select>
        
        <select
          value={selectedCodeType()}
          onChange={(e) => setSelectedCodeType(e.currentTarget.value as TCodeGenType)}
          class="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white"
        >
          <option value="server-functions">Server Functions</option>
          <option value="api-routes">API Routes</option>
          <option value="crud-operations">CRUD Operations</option>
          <option value="type-definitions">Type Definitions</option>
        </select>
        
        <button
          onClick={handleGenerateCode}
          disabled={!selectedSchema() || isGenerating()}
          class="bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 disabled:cursor-not-allowed px-3 py-1.5 rounded transition-colors"
        >
          {isGenerating() ? 'Generating...' : 'Generate'}
        </button>
        
        <button
          onClick={handleClearAll}
          class="bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded transition-colors"
        >
          Clear All
        </button>
      </div>

      {showCodeModal() && (
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div class="bg-[#1a1a1a] border border-gray-600 rounded-lg max-w-4xl max-h-[80vh] w-full mx-4">
            <div class="flex items-center justify-between p-4 border-b border-gray-600">
              <h3 class="text-white font-medium">Generated Code</h3>
              <div class="flex gap-2">
                <button
                  onClick={copyCodeToClipboard}
                  class="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm transition-colors"
                >
                  Copy
                </button>
                <button
                  onClick={() => setShowCodeModal(false)}
                  class="bg-gray-600 hover:bg-gray-700 px-3 py-1 rounded text-sm transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
            <pre class="p-4 overflow-auto text-sm text-gray-300 font-mono whitespace-pre-wrap max-h-96">
              {generatedCode()}
            </pre>
          </div>
        </div>
      )}

      {showCmdModal() && (
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div class="bg-[#1a1a1a] border border-gray-600 rounded-lg max-w-4xl w-full mx-4">
            <div class="flex items-center justify-between p-4 border-b border-gray-600">
              <h3 class="text-white font-medium">Generate Files→JSON Command</h3>
              <div class="flex gap-2">
                <button
                  onClick={copyCmdToClipboard}
                  class="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm transition-colors"
                >
                  Copy Command
                </button>
                <button
                  onClick={() => setShowCmdModal(false)}
                  class="bg-gray-600 hover:bg-gray-700 px-3 py-1 rounded text-sm transition-colors"
                >
                  Close
                </button>
              </div>
            </div>

            <div class="p-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <label class="flex flex-col gap-1">
                <span class="text-gray-300">Root</span>
                <input
                  value={cmdOptions().root}
                  onInput={(e) => setOption('root', e.currentTarget.value)}
                  class="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white"
                  placeholder="."
                />
              </label>

              <label class="flex flex-col gap-1">
                <span class="text-gray-300">Max Depth</span>
                <input
                  value={cmdOptions().maxDepth}
                  onInput={(e) => setOption('maxDepth', e.currentTarget.value)}
                  class="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white"
                  placeholder="empty = unlimited"
                />
              </label>

              <label class="flex flex-col gap-1 md:col-span-2">
                <span class="text-gray-300">Include Dirs (comma)</span>
                <input
                  value={cmdOptions().includeDirs}
                  onInput={(e) => setOption('includeDirs', e.currentTarget.value)}
                  class="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white"
                  placeholder="src,app,packages"
                />
              </label>

              <label class="flex flex-col gap-1 md:col-span-2">
                <span class="text-gray-300">Exclude Dirs (comma)</span>
                <input
                  value={cmdOptions().excludeDirs}
                  onInput={(e) => setOption('excludeDirs', e.currentTarget.value)}
                  class="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white"
                  placeholder="node_modules,.git,dist"
                />
              </label>

              <label class="flex flex-col gap-1 md:col-span-2">
                <span class="text-gray-300">Include Extensions (comma)</span>
                <input
                  value={cmdOptions().includeExts}
                  onInput={(e) => setOption('includeExts', e.currentTarget.value)}
                  class="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white"
                  placeholder="ts,tsx,js,jsx,md,json,css"
                />
              </label>

              <label class="flex flex-col gap-1 md:col-span-2">
                <span class="text-gray-300">Exclude Extensions (comma)</span>
                <input
                  value={cmdOptions().excludeExts}
                  onInput={(e) => setOption('excludeExts', e.currentTarget.value)}
                  class="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white"
                  placeholder="lock,log,svg,png,jpg"
                />
              </label>

              <label class="inline-flex items-center gap-2 md:col-span-2">
                <input
                  type="checkbox"
                  checked={cmdOptions().followSymlinks}
                  onChange={(e) => setOption('followSymlinks', e.currentTarget.checked)}
                />
                <span class="text-gray-300">Follow symlinks</span>
              </label>
            </div>

            <div class="px-4 pb-4">
              <button
                onClick={buildCommand}
                class="bg-gray-700 hover:bg-gray-600 px-3 py-1.5 rounded text-sm transition-colors"
              >
                Refresh Command
              </button>
            </div>

            <pre class="p-4 overflow-auto text-xs text-gray-300 font-mono whitespace-pre-wrap border-t border-gray-700">
              {cmd()}
            </pre>
          </div>
        </div>
      )}
    </>
  );
}
