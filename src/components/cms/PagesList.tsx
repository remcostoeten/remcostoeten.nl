import React from 'react';
import { Page } from '../../types/cms';
import { Plus, Edit, Eye, EyeOff, Trash2 } from 'lucide-react';

interface PagesListProps {
  pages: Page[];
  onEdit: (page: Page) => void;
  onCreate: () => void;
  onDelete: (pageId: string) => void;
  onTogglePublish: (pageId: string) => void;
}

export default function PagesList({ pages, onEdit, onCreate, onDelete, onTogglePublish }: PagesListProps) {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-foreground">Pages</h2>
        <button
          onClick={onCreate}
          className="flex items-center px-4 py-2 bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Page
        </button>
      </div>
      
      <div className="bg-card rounded-lg shadow-sm border border-border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted border-b border-border">
              <tr>
                <th className="text-left py-3 px-6 font-medium text-foreground">Title</th>
                <th className="text-left py-3 px-6 font-medium text-foreground">Slug</th>
                <th className="text-left py-3 px-6 font-medium text-foreground">Status</th>
                <th className="text-left py-3 px-6 font-medium text-foreground">Updated</th>
                <th className="text-right py-3 px-6 font-medium text-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pages.map((page) => (
                <tr key={page.id} className="border-b border-border hover:bg-muted/50">
                  <td className="py-4 px-6">
                    <div>
                      <div className="font-medium text-foreground">{page.title}</div>
                      <div className="text-sm text-muted-foreground">{page.description}</div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <code className="px-2 py-1 bg-muted rounded text-sm">/{page.slug}</code>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      page.isPublished 
                        ? 'bg-accent/20 text-accent' 
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {page.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-sm text-muted-foreground">
                    {page.updatedAt.toLocaleDateString()}
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => onEdit(page)}
                        className="p-2 text-muted-foreground hover:text-accent transition-colors"
                        title="Edit page"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onTogglePublish(page.id)}
                        className="p-2 text-muted-foreground hover:text-accent transition-colors"
                        title={page.isPublished ? 'Unpublish' : 'Publish'}
                      >
                        {page.isPublished ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => onDelete(page.id)}
                        className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                        title="Delete page"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}