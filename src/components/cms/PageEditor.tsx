import React, { useState } from 'react';
import { Page, ContentBlock } from '@/types/cms';
import { ArrowLeft, Save, Eye, Plus, GripVertical } from 'lucide-react';
import BlockEditor from './BlockEditor';
import PagePreview from './PagePreview';
import { motion, Reorder } from 'framer-motion';

interface PageEditorProps {
  page: Page;
  onSave: (page: Page) => void;
  onBack: () => void;
}

export default function PageEditor({ page, onSave, onBack }: PageEditorProps) {
  const [editingPage, setEditingPage] = useState<Page>(page);
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  const handlePageInfoChange = (field: keyof Pick<Page, 'title' | 'slug' | 'description' | 'isPublished'>, value: string | boolean) => {
    setEditingPage(prev => ({
      ...prev,
      [field]: value,
      updatedAt: new Date()
    }));
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

  const handleReorderBlocks = (newOrder: string[]) => {
    const reorderedBlocks = newOrder.map(id => editingPage.blocks.find(block => block.id === id)!);
    setEditingPage(prev => ({
      ...prev,
      blocks: reorderedBlocks.map((block, index) => ({ ...block, order: index })),
      updatedAt: new Date()
    }));
  };

  const handleSave = () => {
    onSave(editingPage);
  };

  return (
    <div className="flex h-screen">
      {/* Editor Panel */}
      <div className={`${isPreviewMode ? 'w-1/2' : 'w-full'} flex flex-col border-r border-border`}>
        {/* Header */}
        <div className="bg-card border-b border-border p-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="p-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-semibold text-foreground">Edit Page</h1>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsPreviewMode(!isPreviewMode)}
              className={`px-3 py-2 rounded-lg transition-colors ${
                isPreviewMode 
                  ? 'bg-accent/20 text-accent' 
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 transition-colors flex items-center"
            >
              <Save className="w-4 h-4 mr-2" />
              Save
            </button>
          </div>
        </div>

        {/* Page Info */}
        <div className="bg-card border-b border-border p-6">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Title</label>
              <input
                type="text"
                value={editingPage.title}
                onChange={(e) => handlePageInfoChange('title', e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:ring-2 focus:ring-ring focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Slug</label>
              <input
                type="text"
                value={editingPage.slug}
                onChange={(e) => handlePageInfoChange('slug', e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:ring-2 focus:ring-ring focus:border-transparent"
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-foreground mb-2">Description</label>
            <textarea
              value={editingPage.description}
              onChange={(e) => handlePageInfoChange('description', e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:ring-2 focus:ring-ring focus:border-transparent"
            />
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="published"
              checked={editingPage.isPublished}
              onChange={(e) => handlePageInfoChange('isPublished', e.target.checked)}
              className="h-4 w-4 text-accent focus:ring-ring border-input rounded"
            />
            <label htmlFor="published" className="ml-2 text-sm text-foreground">
              Published
            </label>
          </div>
        </div>

        {/* Content Blocks */}
        <div className="flex-1 overflow-y-auto bg-background p-6">
          <Reorder.Group axis="y" onReorder={handleReorderBlocks} values={editingPage.blocks.map(block => block.id)} className="space-y-4">
            {editingPage.blocks
              .sort((a, b) => a.order - b.order)
              .map((block) => (
                <Reorder.Item
                  key={block.id}
                  value={block.id}
                  className="group relative bg-card rounded-lg border border-border hover:border-accent/50 transition-colors"
                >
                  <div className="absolute left-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                  </div>
                  <BlockEditor
                    block={block}
                    onChange={(updatedBlock) => handleBlockChange(block.id, updatedBlock)}
                    onDelete={() => handleDeleteBlock(block.id)}
                  />
                </Reorder.Item>
              ))}
            
            {/* Add Block Buttons */}
            <div className="flex space-x-2">
              <button
                onClick={() => handleAddBlock('heading')}
                className="flex items-center px-4 py-2 bg-card border border-border rounded-lg hover:bg-muted transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Heading
              </button>
              <button
                onClick={() => handleAddBlock('paragraph')}
                className="flex items-center px-4 py-2 bg-card border border-border rounded-lg hover:bg-muted transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Paragraph
              </button>
            </div>
          </Reorder.Group>
        </div>
      </div>

      {/* Preview Panel */}
      {isPreviewMode && (
        <div className="w-1/2 bg-background">
          <PagePreview page={editingPage} />
        </div>
      )}
    </div>
  );
}