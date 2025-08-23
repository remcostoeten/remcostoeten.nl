import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, Hash, Github, Palette, Type, Bold, Italic, Underline, X, ArrowLeft, MessageSquarePlus } from 'lucide-react';
import { cn } from '../shared/utilities/cn';
import { ContactPopoverTrigger } from './contact-popover-trigger';
import { Textarea } from "@/shared/components/ui/textarea";


type TSelection = {
  start: number;
  end: number;
  text: string;
}

type TPopoverPosition = {
  x: number;
  y: number;
}

type TRichTextEditorProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  maxLength?: number;
}

type THighlightColor = {
  name: string;
  value: string;
  class: string;
  textClass?: string;
}

type TMarkupMatch = {
  type: 'highlight' | 'project' | 'link' | 'dynamic' | 'contact';
  text: string;
  params: string[];
  fullMatch: string;
}

type MenuType = 'main' | 'highlight' | 'link' | 'project' | 'tag' | 'format';


const HIGHLIGHT_COLORS: THighlightColor[] = [
  { name: 'Yellow', value: '#fef08a', class: 'bg-yellow-200', textClass: 'text-yellow-800' },
  { name: 'Green', value: '#bbf7d0', class: 'bg-green-200', textClass: 'text-green-800' },
  { name: 'Blue', value: '#bfdbfe', class: 'bg-blue-200', textClass: 'text-blue-800' },
  { name: 'Purple', value: '#e9d5ff', class: 'bg-purple-200', textClass: 'text-purple-800' },
  { name: 'Pink', value: '#fbcfe8', class: 'bg-pink-200', textClass: 'text-pink-800' },
  { name: 'Orange', value: '#fed7aa', class: 'bg-orange-200', textClass: 'text-orange-800' },
  { name: 'Red', value: '#fecaca', class: 'bg-red-200', textClass: 'text-red-800' },
  { name: 'Gray', value: '#e5e7eb', class: 'bg-gray-200', textClass: 'text-gray-800' },
];

const TAG_TYPES = [
  { value: 'frontend', label: 'Frontend', color: 'blue' },
  { value: 'backend', label: 'Backend', color: 'green' },
  { value: 'fullstack', label: 'Full Stack', color: 'purple' },
  { value: 'design', label: 'Design', color: 'pink' },
  { value: 'mobile', label: 'Mobile', color: 'orange' },
  { value: 'devops', label: 'DevOps', color: 'red' },
  { value: 'ai', label: 'AI/ML', color: 'indigo' },
  { value: 'blockchain', label: 'Blockchain', color: 'yellow' },
] as const;

const FORMAT_OPTIONS = [
  { key: 'bold', label: 'Bold', icon: Bold, prefix: '**', suffix: '**' },
  { key: 'italic', label: 'Italic', icon: Italic, prefix: '_', suffix: '_' },
  { key: 'code', label: 'Code', icon: Type, prefix: '`', suffix: '`' },
] as const;


function parseMarkup(text: string) {
  const patterns = [
    { type: 'highlight' as const, regex: /Highlight:([ ^ :]+):([ ^ ]+)]/g },
    { type: 'project' as const, regex: /Project:([ ^ :]+):([ ^ :]+)(?::([ ^ :]+):([ ^ ]+))?]/g },
    { type: 'link' as const, regex: /Link:([ ^ :]+):([ ^ ]+)]/g },
    { type: 'dynamic' as const, regex: /Dynamic:([ ^ ]+)]/g },
    { type: 'contact' as const, regex: /\[ContactPopover:([^\]]+)\]/g },
  ];

  const matches: TMarkupMatch[] = [];
  
  patterns.forEach(({ type, regex }) => {
    let match;
    const tempRegex = new RegExp(regex.source, regex.flags);
    while ((match = tempRegex.exec(text)) !== null) {
      matches.push({
        type,
        text: match[1] || match[0],
        params: match.slice(1),
        fullMatch: match[0],
      });
    }
  });

  return matches;
};

function validateUrl(url: string) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};


function useTextSelection(editorRef: React.RefObject<HTMLTextAreaElement | null>) {
  const [selection, setSelection] = useState<TSelection | null>(null);

  const handleSelection = useCallback(() => {
    const textarea = editorRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end).trim();
    
    if (selectedText.length > 0) {
      setSelection({ start, end, text: selectedText });
      return true;
    } else {
      setSelection(null);
      return false;
    }
  }, []);

  return { selection, handleSelection, setSelection };
};

function usePopover() {
  const [showPopover, setShowPopover] = useState(false);
  const [popoverPosition, setPopoverPosition] = useState<TPopoverPosition>({ x: 0, y: 0 });
  const popoverRef = useRef<HTMLDivElement>(null);

  const updatePosition = useCallback((textarea: HTMLTextAreaElement) => {
    const rect = textarea.getBoundingClientRect();
    setPopoverPosition({
      x: rect.width / 2,
      y: -10
    });
  }, []);

  return {
    showPopover,
    setShowPopover,
    popoverPosition,
    updatePosition,
    popoverRef
  };
};


const ColorGrid: React.FC<{
  colors: THighlightColor[];
  onColorSelect: (color: THighlightColor) => void;
}> = ({ colors, onColorSelect }) => (
  <div className="grid grid-cols-4 gap-1">
    {colors.map((color) => (
      <button
        key={color.name}
        onClick={() => onColorSelect(color)}
        className={`${color.class} ${color.textClass} p-2 rounded-none text-xs font-medium hover:opacity-80 transition-opacity border border-transparent hover:border-gray-300`}
        title={color.name}
      >
        {color.name}
      </button>
    ))}
  </div>
);

const TagSelector: React.FC<{
  selectedTag: string;
  onTagSelect: (tag: string) => void;
  onApply: () => void;
}> = ({ selectedTag, onTagSelect, onApply }) => (
  <div className="space-y-3">
    <div className="grid grid-cols-2 gap-1">
      {TAG_TYPES.map((tag) => (
        <button
          key={tag.value}
          onClick={() => onTagSelect(tag.value)}
          className={`p-2 rounded-none text-xs font-medium transition-colors border ${
            selectedTag === tag.value
              ? `bg-${tag.color}-100 border-${tag.color}-300 text-${tag.color}-800`
              : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
          }`}
        >
          {tag.label}
        </button>
      ))}
    </div>
    
    <button
      onClick={onApply}
      className="w-full px-3 py-2 text-sm bg-green-500 text-white rounded-none hover:bg-green-600 transition-colors"
    >
      Add Tag
    </button>
  </div>
);

const LinkForm: React.FC<{
  url: string;
  onUrlChange: (url: string) => void;
  onSubmit: () => void;
  isValid: boolean;
}> = ({ url, onUrlChange, onSubmit, isValid }) => (
  <div className="space-y-3">
    <div className="space-y-2">
      <input
        type="url"
      placeholder="https://example.com"
        value={url}
        onChange={(e) => onUrlChange(e.target.value)}
        className={`w-full px-3 py-2 text-sm border rounded-none focus:outline-none focus:ring-2 transition-colors ${
          url && !isValid 
            ? 'border-red-300 focus:ring-red-500' 
            : 'border-gray-200 focus:ring-blue-500'
        }`}
        autoFocus
      />
      {url && !isValid && (
        <p className="text-xs text-red-500">Please enter a valid URL</p>
      )}
    </div>
    
    <button
      onClick={onSubmit}
      disabled={!url.trim() || !isValid}
      className="w-full px-3 py-2 text-sm bg-blue-500 text-white rounded-none hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      Add Link
    </button>
  </div>
);

const ProjectForm: React.FC<{
  url: string;
  owner: string;
  repo: string;
  onUrlChange: (url: string) => void;
  onOwnerChange: (owner: string) => void;
  onRepoChange: (repo: string) => void;
  onSubmit: () => void;
  isValid: boolean;
}> = ({ url, owner, repo, onUrlChange, onOwnerChange, onRepoChange, onSubmit, isValid }) => (
  <div className="space-y-3">
    <input
      type="url"
      placeholder="Project URL (required)"
      value={url}
      onChange={(e) => onUrlChange(e.target.value)}
      className={`w-full px-3 py-2 text-sm border rounded-none focus:outline-none focus:ring-2 transition-colors ${
        url && !isValid 
          ? 'border-red-300 focus:ring-red-500' 
          : 'border-gray-200 focus:ring-purple-500'
      }`}
      autoFocus
    />
    
    <div className="text-xs text-gray-500 px-1">
      Optional: GitHub repository for enhanced display (auto-detected from URL)
    </div>
    
    <div className="grid grid-cols-2 gap-2">
      <input
        type="text"
        placeholder="Owner/Organization"
        value={owner}
        onChange={(e) => onOwnerChange(e.target.value)}
        className="px-3 py-2 text-sm border border-gray-200 rounded-none focus:outline-none focus:ring-2 focus:ring-purple-500"
      />
      <input
        type="text"
        placeholder="Repository name"
        value={repo}
        onChange={(e) => onRepoChange(e.target.value)}
        className="px-3 py-2 text-sm border border-gray-200 rounded-none focus:outline-none focus:ring-2 focus:ring-purple-500"
      />
    </div>
    
    {url && !isValid && (
      <p className="text-xs text-red-500">Please enter a valid project URL</p>
    )}
    
    <button
      onClick={onSubmit}
      disabled={!url.trim() || !isValid}
      className="w-full px-3 py-2 text-sm bg-purple-500 text-white rounded-none hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      Add Project
    </button>
  </div>
);

const PopoverMenu: React.FC<{
  activeMenu: MenuType;
  setActiveMenu: (menu: MenuType) => void;
  selection: TSelection;
  onHighlight: (color: THighlightColor) => void;
  onLink: () => void;
  onProject: () => void;
  onTag: () => void;
  onFormat: (format: typeof FORMAT_OPTIONS[number]) => void;
  onContact: () => void;
  linkUrl: string;
  setLinkUrl: (url: string) => void;
  projectUrl: string;
  setProjectUrl: (url: string) => void;
  projectOwner: string;
  setProjectOwner: (owner: string) => void;
  projectRepo: string;
  setProjectRepo: (repo: string) => void;
  tagType: string;
  setTagType: (type: string) => void;
}> = ({
  activeMenu,
  setActiveMenu,
  selection,
  onHighlight,
  onLink,
  onProject,
  onTag,
  onFormat,
  onContact,
  linkUrl,
  setLinkUrl,
  projectUrl,
  setProjectUrl,
  projectOwner,
  setProjectOwner,
  projectRepo,
  setProjectRepo,
  tagType,
  setTagType,
}) => {
  const isLinkValid = useMemo(() => !linkUrl || validateUrl(linkUrl), [linkUrl]);
  const isProjectValid = useMemo(() => !projectUrl || validateUrl(projectUrl), [projectUrl]);

  const renderHeader = (title: string, showBack: boolean = true) => (
    <div className="flex items-center justify-between px-2 py-1 border-b border-gray-100">
      <span className="text-xs text-gray-500">{title}</span>
      {showBack && (
        <button
          onClick={() => setActiveMenu('main')}
          className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors"
        >
          <ArrowLeft className="w-3 h-3" />
          Back
        </button>
      )}
    </div>
  );

  switch (activeMenu) {
    case 'main':
      return (
        <div className="space-y-1">
          <div className="text-xs text-gray-500 px-2 py-1 border-b border-gray-100">
            Selected: "{selection.text.length > 25 ? selection.text.substring(0, 25) + '...' : selection.text}"
          </div>
          
          <button
            onClick={() => setActiveMenu('format')}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 rounded-none transition-colors"
          >
            <Type className="w-4 h-4 text-gray-500" />
            Format Text
          </button>
          
          <button
            onClick={() => setActiveMenu('highlight')}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 rounded-none transition-colors"
          >
            <Palette className="w-4 h-4 text-yellow-500" />
            Highlight Text
          </button>
          
          <button
            onClick={() => setActiveMenu('link')}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 rounded-none transition-colors"
          >
            <Link className="w-4 h-4 text-blue-500" />
            Add Link
          </button>
          
          <button
            onClick={() => setActiveMenu('project')}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 rounded-none transition-colors"
          >
            <Github className="w-4 h-4 text-purple-500" />
            Add Project
          </button>
          
          <button
            onClick={() => setActiveMenu('tag')}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 rounded-none transition-colors"
          >
            <Hash className="w-4 h-4 text-green-500" />
            Add Tag
          </button>
          
          <button
            onClick={onContact}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 rounded-none transition-colors"
          >
            <MessageSquarePlus className="w-4 h-4 text-indigo-500" />
            Add Contact
          </button>
        </div>
      );

    case 'format':
      return (
        <div className="space-y-2">
          {renderHeader('Format options')}
          <div className="space-y-1">
            {FORMAT_OPTIONS.map((format) => (
              <button
                key={format.key}
                onClick={() => onFormat(format)}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 rounded-none transition-colors"
              >
                <format.icon className="w-4 h-4 text-gray-500" />
                {format.label}
              </button>
            ))}
          </div>
        </div>
      );

    case 'highlight':
      return (
        <div className="space-y-2">
          {renderHeader('Choose highlight color')}
          <ColorGrid colors={HIGHLIGHT_COLORS} onColorSelect={onHighlight} />
        </div>
      );

    case 'link':
      return (
        <div className="space-y-3">
          {renderHeader('Add link')}
          <LinkForm
            url={linkUrl}
            onUrlChange={setLinkUrl}
            onSubmit={onLink}
            isValid={isLinkValid}
          />
        </div>
      );

    case 'project':
      return (
        <div className="space-y-3">
          {renderHeader('Add project')}
          <ProjectForm
            url={projectUrl}
            owner={projectOwner}
            repo={projectRepo}
            onUrlChange={setProjectUrl}
            onOwnerChange={setProjectOwner}
            onRepoChange={setProjectRepo}
            onSubmit={onProject}
            isValid={isProjectValid}
          />
        </div>
      );

    case 'tag':
      return (
        <div className="space-y-3">
          {renderHeader('Add tag')}
          <TagSelector
            selectedTag={tagType}
            onTagSelect={setTagType}
            onApply={onTag}
          />
        </div>
      );

    default:
      return null;
  }
};


export function RichTextEditor({ 
  value, 
  onChange, 
  placeholder = "Start typing...",
  className,
  disabled = false,
  maxLength
}: TRichTextEditorProps) {
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const { selection, handleSelection, setSelection } = useTextSelection(editorRef);
  const { showPopover, setShowPopover, popoverPosition, updatePosition, popoverRef } = usePopover();
  
  const [activeMenu, setActiveMenu] = useState<MenuType>('main');
  const [linkUrl, setLinkUrl] = useState('');
  const [projectUrl, setProjectUrl] = useState('');
  const [projectOwner, setProjectOwner] = useState('');
  const [projectRepo, setProjectRepo] = useState('');
  const [tagType, setTagType] = useState('frontend');

  
  const handleTextSelection = useCallback(() => {
    const hasSelection = handleSelection();
    if (hasSelection && editorRef.current) {
      updatePosition(editorRef.current);
      setShowPopover(true);
      setActiveMenu('main');
    } else {
      setShowPopover(false);
    }
  }, [handleSelection, updatePosition]);

  const handleMouseUp = useCallback(() => {
    setTimeout(handleTextSelection, 10);
  }, [handleTextSelection]);

  
  const insertMarkup = useCallback((markup: string) => {
    if (!selection) return;

    const beforeText = value.substring(0, selection.start);
    const afterText = value.substring(selection.end);
    const newValue = beforeText + markup + afterText;
    
    onChange(newValue);
    setShowPopover(false);
    setSelection(null);
    
    
    setLinkUrl('');
    setProjectUrl('');
    setProjectOwner('');
    setProjectRepo('');
  }, [selection, value, onChange, setSelection]);

  
  const handleHighlight = useCallback((color: THighlightColor) => {
    if (!selection) return;
    const markup = `[highlight:${selection.text}:${color.name.toLowerCase()}]`;
    insertMarkup(markup);
  }, [selection, insertMarkup]);

  const handleLink = useCallback(() => {
    if (!selection || !linkUrl.trim() || !validateUrl(linkUrl)) return;
    const markup = `[link:${selection.text}:${linkUrl.trim()}]`;
    insertMarkup(markup);
  }, [selection, linkUrl, insertMarkup]);

  const handleProject = useCallback(() => {
    if (!selection || !projectUrl.trim() || !validateUrl(projectUrl)) return;
    
    
    let finalOwner = projectOwner.trim();
    let finalRepo = projectRepo.trim();
    
    if (!finalOwner || !finalRepo) {
      const githubMatch = projectUrl.match(/github\.com\/([^\/]+)\/([^\/\?#]+)/);
      if (githubMatch) {
        finalOwner = finalOwner || githubMatch[1];
        finalRepo = finalRepo || githubMatch[2];
      }
    }
    
    let markup = `[project:${selection.text}:${projectUrl.trim()}`;
    if (finalOwner && finalRepo) {
      markup += `:${finalOwner}:${finalRepo}`;
    }
    markup += `]`;
    insertMarkup(markup);
  }, [selection, projectUrl, projectOwner, projectRepo, insertMarkup]);

  const handleTag = useCallback(() => {
    if (!selection) return;
    const tagConfig = TAG_TYPES.find(t => t.value === tagType);
    const markup = `[highlight:${selection.text}:${tagType}]`;
    insertMarkup(markup);
  }, [selection, tagType, insertMarkup]);

  const handleFormat = useCallback((format: typeof FORMAT_OPTIONS[number]) => {
    if (!selection) return;
    const markup = `${format.prefix}${selection.text}${format.suffix}`;
    insertMarkup(markup);
  }, [selection, insertMarkup]);

  const handleContact = useCallback(() => {
    if (!selection) return;
    const markup = `[ContactPopover:${selection.text}]`;
    insertMarkup(markup);
  }, [selection, insertMarkup]);

  
  const renderContent = useMemo(() => {
    if (!value) return <span className="text-gray-500 italic">{placeholder}</span>;
    
    const parts = value.split(/(\[ContactPopover:[^\]]+\]|\[highlight:[^\]]+:[^\]]+\]|\[project:[^\]]+:[^\]]+(?::[^\]]+:[^\]]+)?\]|\[link:[^\]]+:[^\]]+\]|\[dynamic:[^\]]+\]|\*\*[^*]+\*\*|_[^_]+_|`[^`]+`)/g);
    
    return parts.map((part, index) => {
      
      if (part.match(/^\*\*[^*]+\*\*$/)) {
        return <strong key={index}>{part.slice(2, -2)}</strong>;
      }
      if (part.match(/^_[^_]+_$/)) {
        return <em key={index}>{part.slice(1, -1)}</em>;
      }
      if (part.match(/^`[^`]+`$/)) {
        return <code key={index} className="font-mono text-sm bg-muted text-muted-foreground px-1 rounded-none">{part.slice(1, -1)}</code>;
      }

      
      const highlightMatch = part.match(/\[highlight:([^:]+):([^\]]+)\]/);
      if (highlightMatch) {
        const [, text, type] = highlightMatch;
        const color = HIGHLIGHT_COLORS.find(c => c.name.toLowerCase() === type.toLowerCase());
        const tagType = TAG_TYPES.find(t => t.value === type);
        
        if (color) {
          return (
            <span key={index} className={`${color.class} ${color.textClass} px-1 rounded-none font-medium`}>
              {text}
            </span>
          );
        } else if (tagType) {
          return (
            <span key={index} className={`bg-${tagType.color}-100 text-${tagType.color}-800 px-2 py-1 rounded-none-full text-xs font-medium`}>
              {text}
            </span>
          );
        }
      }

      
      const projectMatch = part.match(/\[project:([^:]+):([^:]+)(?::([^:]+):([^\]]+))?\]/);
      if (projectMatch) {
        const [, text, , owner, repo] = projectMatch;
        return (
          <span key={index} className="inline-flex items-center gap-1 text-purple-400 font-medium">
            <Github className="w-3 h-3" />
            {text}
            {owner && repo && (
              <span className="text-xs text-gray-500">({owner}/{repo})</span>
            )}
          </span>
        );
      }

      
      const linkMatch = part.match(/\[link:([^:]+):([^\]]+)\]/);
      if (linkMatch) {
        const [, text] = linkMatch;
        return (
          <span key={index} className="inline-flex items-center gap-1 text-blue-400 underline">
            <Link className="w-3 h-3" />
            {text}
          </span>
        );
      }

      
      const dynamicMatch = part.match(/\[dynamic:([^\]]+)\]/);
      if (dynamicMatch) {
        const [, type] = dynamicMatch;
        return (
          <span key={index} className="inline-flex items-center gap-1 font-mono text-purple-400 bg-purple-900/20 px-2 py-1 rounded-none text-sm">
            <Type className="w-3 h-3" />
            {type === 'current-time' ? 'Current Time' : type}
          </span>
        );
      }

      const contactMatch = part.match(/\[ContactPopover:([^\]]+)\]/);
      if (contactMatch) {
        const [, label] = contactMatch;
        return <ContactPopoverTrigger key={index} label={label} />;
      }

      return part;
    });
  }, [value, placeholder]);

  
  const characterCount = value?.length || 0;
  const isOverLimit = maxLength ? characterCount > maxLength : false;

  
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node) &&
          editorRef.current && !editorRef.current.contains(event.target as Node)) {
        setShowPopover(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const textarea = editorRef.current;
    if (!textarea || disabled) return;

    textarea.addEventListener('mouseup', handleMouseUp);
    textarea.addEventListener('keyup', handleMouseUp);
    
    return () => {
      textarea.removeEventListener('mouseup', handleMouseUp);
      textarea.removeEventListener('keyup', handleMouseUp);
    };
  }, [handleMouseUp, disabled]);

  return (
    <div className="relative">
      <div className="relative">
        <Textarea
          ref={editorRef}
          value={value}
          onChange={(e) => {
            if (maxLength && e.target.value.length > maxLength) return;
            onChange(e.target.value);
          }}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            "cms-input min-h-[180px] w-full rounded-none resize-y leading-relaxed text-sm",
            isOverLimit && "border-destructive focus:ring-destructive",
            className
          )}
        />
        
        {maxLength && (
          <div className={`absolute bottom-2 right-2 text-xs ${isOverLimit ? 'text-red-400' : 'text-gray-500'}`}>
            {characterCount}/{maxLength}
          </div>
        )}
      </div>
      
      {}
      <div className="mt-3 p-4 border border-border rounded-none-lg bg-card/50">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-gray-400">Preview</span>
          {parseMarkup(value).length > 0 && (
            <span className="text-xs text-gray-500">
              {parseMarkup(value).length} markup{parseMarkup(value).length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        <div className="prose prose-sm max-w-none leading-relaxed text-neutral-400">
          {renderContent}
        </div>
      </div>

      {}
      <AnimatePresence>
        {showPopover && selection && !disabled && (
          <motion.div
            ref={popoverRef}
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute z-50 cms-card rounded-none-lg shadow-xl border border-border p-2 min-w-[280px] max-w-[420px]"
            style={{
              left: `${popoverPosition.x}px`,
              top: `${popoverPosition.y}px`,
              transform: 'translateX(-50%)'
            }}
          >
            <PopoverMenu
              activeMenu={activeMenu}
              setActiveMenu={setActiveMenu}
              selection={selection}
              onHighlight={handleHighlight}
              onLink={handleLink}
              onProject={handleProject}
              onTag={handleTag}
              onFormat={handleFormat}
              onContact={handleContact}
              linkUrl={linkUrl}
              setLinkUrl={setLinkUrl}
              projectUrl={projectUrl}
              setProjectUrl={setProjectUrl}
              projectOwner={projectOwner}
              setProjectOwner={setProjectOwner}
              projectRepo={projectRepo}
              setProjectRepo={setProjectRepo}
              tagType={tagType}
              setTagType={setTagType}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}