import React from 'react';
import { Page } from '@/types/cms';
import { Plus, Edit, Trash2, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PagesListProps {
  pages: Page[];
  onEdit: (page: Page) => void;
  onCreate: () => void;
  onDelete: (pageId: string) => void;
}

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;
  
  return date.toLocaleDateString();
}

export default function PagesList({ pages, onEdit, onCreate, onDelete }: PagesListProps) {
  const totalPages = pages.length;
  
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Pages</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {totalPages} {totalPages === 1 ? 'page' : 'pages'}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-xs text-muted-foreground">
            <kbd>CapsLock</kbd> + <kbd>S</kbd> to save, <kbd>CapsLock</kbd> + <kbd>Z</kbd> to revert
          </div>
          <button
            onClick={onCreate}
            className="flex items-center px-4 py-2 bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Page
          </button>
        </div>
      </div>
      
      <div className="bg-card rounded-lg shadow-sm border border-border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted border-b border-border">
              <tr>
                <th className="text-left py-3 px-6 font-medium text-foreground">Title</th>
                <th className="text-left py-3 px-6 font-medium text-foreground">Slug</th>
                <th className="text-left py-3 px-6 font-medium text-foreground">Updated</th>
                <th className="text-right py-3 px-6 font-medium text-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence initial={false}>
                {pages.map((page) => (
                  <motion.tr
                    key={page.id}
                    className="border-b border-border hover:bg-muted/50"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    layout
                    transition={{ duration: 0.2, ease: "easeOut" }}
                  >
                    <td className="py-4 px-6">
                      <div>
                        <div className="font-medium text-foreground">{page.title}</div>
                        <div className="text-sm text-muted-foreground">{page.description}</div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <code className="px-2 py-1 bg-muted rounded text-sm">/{page.slug}</code>
                        {page.slug === 'home' && (
                          <span className="text-xs bg-blue-500/20 text-blue-600 px-2 py-0.5 rounded-full">
                            Home Page
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm text-muted-foreground">
                        <div>{formatTimeAgo(page.updatedAt)}</div>
                        <div className="text-xs" title={page.updatedAt.toLocaleString()}>
                          {page.updatedAt.toLocaleDateString()}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => onEdit(page)}
                          className="px-3 py-1 text-sm bg-accent text-accent-foreground rounded hover:bg-accent/90 transition-colors"
                        >
                          Edit
                        </button>
                        {page.slug !== 'home' && (
                          <button
                            onClick={() => onDelete(page.id)}
                            className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                            title="Delete page"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
