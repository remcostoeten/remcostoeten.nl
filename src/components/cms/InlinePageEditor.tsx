import React, { useState, useEffect } from 'react';
import { Page, ContentBlock, ContentSegment } from '@/types/cms';
import InlineBlock from './InlineBlock';
import LivePageRenderer from './LivePageRenderer';
import { Edit3, Eye, Save, ArrowLeft, Plus, Type, FileText, Check, Clock } from 'lucide-react';

interface InlinePageEditorProps {
  page: Page;
  onSave: (page: Page) => void;
  onBack: () => void;
}

export default function InlinePageEditor({ page, onSave, onBack }: InlinePageEditorProps) {
  const [editingPage, setEditingPage] = useState<Page>(page);
  const [isEditing, setIsEditing] = useState(false);
  const [editingSegment, setEditingSegment] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const handleToggleEdit = () => {
    setIsEditing(!isEditing);
    setEditingSegment(null);
  };

  const handleSave = async () => {
    setSaveStatus('saving');
    setHasUnsavedChanges(false);
    
    // Simulate save delay for better UX feedback
    await new Promise(resolve => setTimeout(resolve, 500));
    
    onSave(editingPage);
    setSaveStatus('saved');
    
    // Reset save status after 2 seconds
    setTimeout(() => {
      setSaveStatus('idle');
    }, 2000);
    
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
    setHasUnsavedChanges(true);
    setSaveStatus('idle');
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
    setHasUnsavedChanges(true);
    setSaveStatus('idle');
  };

  const handleDeleteBlock = (blockId: string) => {
    if (confirm('Are you sure you want to delete this block?')) {
      setEditingPage(prev => ({
        ...prev,
        blocks: prev.blocks.filter(block => block.id !== blockId),
        updatedAt: new Date()
      }));
      setHasUnsavedChanges(true);
      setSaveStatus('idle');
    }
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
    setHasUnsavedChanges(true);
    setSaveStatus('idle');
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
                <div className="flex items-center gap-3">
                  <h1 className="text-xl font-semibold text-foreground">{editingPage.title}</h1>
                  {hasUnsavedChanges && (
                    <span className="text-xs bg-yellow-500/20 text-yellow-600 px-2 py-1 rounded-full flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Unsaved changes
                    </span>
                  )}
                  {saveStatus === 'saved' && (
                    <span className="text-xs bg-green-500/20 text-green-600 px-2 py-1 rounded-full flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      Saved
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>/{editingPage.slug}</span>
                  <span>•</span>
                  <span>Updated {editingPage.updatedAt.toLocaleString()}</span>
                </div>
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
                  disabled={saveStatus === 'saving'}
                  className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                    saveStatus === 'saving'
                      ? 'bg-muted text-muted-foreground cursor-not-allowed'
                      : saveStatus === 'saved'
                      ? 'bg-green-600 text-white'
                      : hasUnsavedChanges
                      ? 'bg-accent text-accent-foreground hover:bg-accent/90'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {saveStatus === 'saving' ? (
                    <>
                      <div className="w-4 h-4 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : saveStatus === 'saved' ? (
                    <>
                      <Check className="w-4 h-4" />
                      Saved
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      {hasUnsavedChanges ? 'Save Changes' : 'Save'}
                    </>
                  )}
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