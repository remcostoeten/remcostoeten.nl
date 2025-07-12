import React, { useState, useRef, useEffect } from 'react';
import { ContentSegment, BlockStyles } from '../../types/cms';
import { Bold, Italic, Link, Palette, Type, ListOrdered as BorderAll, Minus, Plus, ExternalLink } from 'lucide-react';

interface InlineEditorProps {
  segment: ContentSegment;
  isEditing: boolean;
  onEdit: () => void;
  onSave: (segment: ContentSegment) => void;
  onCancel: () => void;
  blockStyles?: BlockStyles;
  onBlockStylesChange?: (styles: BlockStyles) => void;
}

export default function InlineEditor({ 
  segment, 
  isEditing, 
  onEdit, 
  onSave, 
  onCancel,
  blockStyles,
  onBlockStylesChange
}: InlineEditorProps) {
  const [editingSegment, setEditingSegment] = useState<ContentSegment>(segment);
  const [showStylePanel, setShowStylePanel] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    onSave(editingSegment);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };

  const updateSegmentData = (key: string, value: any) => {
    setEditingSegment(prev => ({
      ...prev,
      data: { ...prev.data, [key]: value }
    }));
  };

  const updateBlockStyles = (key: keyof BlockStyles, value: any) => {
    if (onBlockStylesChange) {
      onBlockStylesChange({
        ...blockStyles,
        [key]: value
      });
    }
  };

  const renderSegmentContent = () => {
    const baseClasses = "transition-all duration-200";
    
    switch (segment.type) {
      case 'highlighted':
        return (
          <span
            className={`${baseClasses} font-medium px-1 rounded`}
            style={{ 
              color: `hsl(${segment.data?.hslColor || '85 100% 75%'})`,
              backgroundColor: segment.data?.backgroundColor || 'transparent',
              padding: segment.data?.padding || '0 4px',
              borderRadius: segment.data?.borderRadius || '4px'
            }}
          >
            {segment.content}
          </span>
        );

      case 'link':
        return (
          <a
            href={segment.data?.url || '#'}
            className={`${baseClasses} text-accent hover:text-accent/80 transition-colors inline-flex items-center gap-1`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontWeight: segment.data?.fontWeight || 'normal',
              fontSize: segment.data?.fontSize ? `var(--font-size-${segment.data.fontSize})` : 'inherit'
            }}
          >
            {segment.content}
            <ExternalLink className="w-3 h-3" />
          </a>
        );

      default:
        return (
          <span 
            className={baseClasses}
            style={{
              fontWeight: segment.data?.fontWeight || 'normal',
              fontSize: segment.data?.fontSize ? `var(--font-size-${segment.data.fontSize})` : 'inherit'
            }}
          >
            {segment.content}
          </span>
        );
    }
  };

  if (!isEditing) {
    return (
      <span
        onClick={onEdit}
        className="cursor-pointer hover:bg-accent/10 rounded px-1 -mx-1 transition-colors"
        title="Click to edit"
      >
        {renderSegmentContent()}
      </span>
    );
  }

  return (
    <div className="relative inline-block">
      {/* Inline Input */}
      <div className="inline-flex items-center gap-2">
        <input
          ref={inputRef}
          type="text"
          value={editingSegment.content}
          onChange={(e) => setEditingSegment(prev => ({ ...prev, content: e.target.value }))}
          onKeyDown={handleKeyDown}
          onBlur={handleSave}
          className="bg-background border border-accent rounded px-2 py-1 text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
          style={{ minWidth: '100px', width: `${editingSegment.content.length + 2}ch` }}
        />
        
        <button
          onClick={() => setShowStylePanel(!showStylePanel)}
          className="p-1 text-muted-foreground hover:text-accent transition-colors"
          title="Style options"
        >
          <Palette className="w-4 h-4" />
        </button>
      </div>

      {/* Style Panel */}
      {showStylePanel && (
        <div className="absolute top-full left-0 mt-2 bg-card border border-border rounded-lg shadow-lg p-4 z-50 min-w-80">
          <div className="space-y-4">
            {/* Segment Type */}
            <div>
              <label className="block text-xs font-medium text-foreground mb-2">Type</label>
              <div className="flex gap-2">
                {['text', 'highlighted', 'link'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setEditingSegment(prev => ({ ...prev, type: type as any }))}
                    className={`px-3 py-1 text-xs rounded transition-colors ${
                      editingSegment.type === type
                        ? 'bg-accent text-accent-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Color for highlighted text */}
            {editingSegment.type === 'highlighted' && (
              <div>
                <label className="block text-xs font-medium text-foreground mb-2">Highlight Color (HSL)</label>
                <input
                  type="text"
                  value={editingSegment.data?.hslColor || '85 100% 75%'}
                  onChange={(e) => updateSegmentData('hslColor', e.target.value)}
                  className="w-full px-2 py-1 text-xs border border-input rounded bg-background text-foreground"
                  placeholder="85 100% 75%"
                />
                <div className="mt-2">
                  <label className="block text-xs font-medium text-foreground mb-1">Background</label>
                  <input
                    type="text"
                    value={editingSegment.data?.backgroundColor || ''}
                    onChange={(e) => updateSegmentData('backgroundColor', e.target.value)}
                    className="w-full px-2 py-1 text-xs border border-input rounded bg-background text-foreground"
                    placeholder="rgba(133, 255, 193, 0.1)"
                  />
                </div>
              </div>
            )}

            {/* URL for links */}
            {editingSegment.type === 'link' && (
              <div>
                <label className="block text-xs font-medium text-foreground mb-2">URL</label>
                <input
                  type="url"
                  value={editingSegment.data?.url || ''}
                  onChange={(e) => updateSegmentData('url', e.target.value)}
                  className="w-full px-2 py-1 text-xs border border-input rounded bg-background text-foreground"
                  placeholder="https://example.com"
                />
              </div>
            )}

            {/* Font Weight */}
            <div>
              <label className="block text-xs font-medium text-foreground mb-2">Font Weight</label>
              <select
                value={editingSegment.data?.fontWeight || 'normal'}
                onChange={(e) => updateSegmentData('fontWeight', e.target.value)}
                className="w-full px-2 py-1 text-xs border border-input rounded bg-background text-foreground"
              >
                <option value="normal">Normal</option>
                <option value="medium">Medium</option>
                <option value="semibold">Semibold</option>
                <option value="bold">Bold</option>
              </select>
            </div>

            {/* Block Borders (if block styles are available) */}
            {onBlockStylesChange && (
              <div>
                <label className="block text-xs font-medium text-foreground mb-2">Block Borders</label>
                <div className="grid grid-cols-2 gap-2">
                  {['borderTop', 'borderBottom', 'borderLeft', 'borderRight'].map((border) => (
                    <label key={border} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={blockStyles?.[border as keyof BlockStyles] || false}
                        onChange={(e) => updateBlockStyles(border as keyof BlockStyles, e.target.checked)}
                        className="rounded border-input"
                      />
                      <span className="text-xs text-foreground capitalize">
                        {border.replace('border', '')}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <button
                onClick={() => setShowStylePanel(false)}
                className="px-3 py-1 text-xs bg-muted text-muted-foreground rounded hover:bg-muted/80 transition-colors"
              >
                Close
              </button>
              <button
                onClick={handleSave}
                className="px-3 py-1 text-xs bg-accent text-accent-foreground rounded hover:bg-accent/90 transition-colors"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}