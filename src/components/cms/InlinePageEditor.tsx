import React, { useState } from 'react';
import { Page, ContentBlock, ContentSegment } from '@/types/cms';
import InlineBlock from './InlineBlock';
import LivePageRenderer from './LivePageRenderer';
import { Edit3, Eye, Save, ArrowLeft, Plus, Type, FileText } from 'lucide-react';

interface InlinePageEditorProps {
  page: Page;
  onSave: (page: Page) => void;
  onBack: () => void;
}

export default function InlinePageEditor({ page, onSave, onBack }: InlinePageEditorProps) {
  const [editingPage, setEditingPage] = useState<Page>(page);
  const [isEditing, setIsEditing] = useState(false);
  const [editingSegment, setEditingSegment] = useState<string | null>(null);

  const handleToggleEdit = () => {
    setIsEditing(!isEditing);
    setEditingSegment(null);
  };

  const handleSave = () => {
    onSave(editingPage);
    setIsEditing(false);
    setEditingSegment(null);
  };

  const handleBlockChange = (blockId: string, updatedBlock: ContentBlock) => {
    setEditingPage(prev => ({
      ...prev,
      blocks: prev.blocks.map(block => 
        block.id === blockId ? updatedBlock : block
      ),
      updatedAt: new Date()
    }));
  };

  const handleAddBlock = (type: 'heading' | 'paragraph') => {
    const newBlock: ContentBlock = {
      id: `block-${Date.now()}`,
      type,
      order: editingPage.blocks.length,
      content: [{
        id: `seg-${Date.now()}`,
        type: 'text',
        content: type === 'heading' ? 'New Heading' : 'New paragraph content.'
      }]
    };

    setEditingPage(prev => ({
      ...prev,
      blocks: [...prev.blocks, newBlock],
      updatedAt: new Date()
    }));
  };

  const handleDeleteBlock = (blockId: string) => {
    setEditingPage(prev => ({
      ...prev,
      blocks: prev.blocks.filter(block => block.id !== blockId),
      updatedAt: new Date()
    }));
  };

  const handleAddSegment = (blockId: string) => {
    const newSegment: ContentSegment = {
      id: `seg-${Date.now()}`,
      type: 'text',
      content: 'new text'
    };

    setEditingPage(prev => ({
      ...prev,
      blocks: prev.blocks.map(block => 
        block.id === blockId 
          ? { ...block, content: [...block.content, newSegment] }
          : block
      ),
      updatedAt: new Date()
    }));
  };

  const handleSegmentEdit = (segmentId: string) => {
    setEditingSegment(segmentId);
  };

  const handleSegmentSave = (segmentId: string, segment: ContentSegment) => {
    setEditingSegment(null);
  };

  const handleSegmentCancel = () => {
    setEditingSegment(null);
  };

  if (!isEditing) {
    return <LivePageRenderer page={editingPage} onBack={onBack} onEdit={() => setIsEditing(true)} />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border z-40">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                title="Back to pages"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-foreground">{editingPage.title}</h1>
                <p className="text-sm text-muted-foreground">/{editingPage.slug}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={handleToggleEdit}
                className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                  isEditing 
                    ? 'bg-accent/20 text-accent' 
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {isEditing ? <Eye className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
                {isEditing ? 'Preview' : 'Edit'}
              </button>
              
              {isEditing && (
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 transition-colors flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Save
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="space-y-8">
          {editingPage.blocks
            .sort((a, b) => a.order - b.order)
            .map((block) => (
              <InlineBlock
                key={block.id}
                block={block}
                isEditing={isEditing}
                editingSegment={editingSegment}
                onSegmentEdit={handleSegmentEdit}
                onSegmentSave={handleSegmentSave}
                onSegmentCancel={handleSegmentCancel}
                onBlockChange={(updatedBlock) => handleBlockChange(block.id, updatedBlock)}
                onBlockDelete={() => handleDeleteBlock(block.id)}
                onAddSegment={() => handleAddSegment(block.id)}
              />
            ))}

          {/* Add Block Buttons */}
          {isEditing && (
            <div className="flex gap-4 pt-8 border-t border-border">
              <button
                onClick={() => handleAddBlock('heading')}
                className="flex items-center gap-2 px-4 py-3 bg-card border border-border rounded-lg hover:bg-muted transition-colors text-foreground"
              >
                <Type className="w-5 h-5" />
                Add Heading
              </button>
              <button
                onClick={() => handleAddBlock('paragraph')}
                className="flex items-center gap-2 px-4 py-3 bg-card border border-border rounded-lg hover:bg-muted transition-colors text-foreground"
              >
                <FileText className="w-5 h-5" />
                Add Paragraph
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}