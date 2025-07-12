'use client';

import React, { useState } from 'react';
import { Page, CMSState } from '@/types/cms';
import { mockPages, createNewPage, generateId } from '@/utils/cms-data';
import CMSLayout from '@/components/cms/Layout';
import PagesList from '@/components/cms/PagesList';
import InlinePageEditor from '@/components/cms/InlinePageEditor';

export default function CMSApp() {
  const [state, setState] = useState<CMSState>({
    currentPage: null,
    pages: mockPages,
    user: null,
    isAuthenticated: true,
    isPreviewMode: false,
    editingSegment: null
  });

  const [currentView, setCurrentView] = useState('pages');

  const handleEditPage = (page: Page) => {
    setState(prev => ({
      ...prev,
      currentPage: page
    }));
  };

  const handleSavePage = (updatedPage: Page) => {
    setState(prev => ({
      ...prev,
      pages: prev.pages.map(p => p.id === updatedPage.id ? updatedPage : p),
      currentPage: null
    }));
  };

  const handleCreatePage = () => {
    const newPage: Page = {
      ...createNewPage(),
      id: generateId()
    };
    
    setState(prev => ({
      ...prev,
      pages: [...prev.pages, newPage],
      currentPage: newPage
    }));
  };

  const handleDeletePage = (pageId: string) => {
    if (confirm('Are you sure you want to delete this page?')) {
      setState(prev => ({
        ...prev,
        pages: prev.pages.filter(p => p.id !== pageId)
      }));
    }
  };

  const handleTogglePublish = (pageId: string) => {
    setState(prev => ({
      ...prev,
      pages: prev.pages.map(p => 
        p.id === pageId 
          ? { ...p, isPublished: !p.isPublished, updatedAt: new Date() }
          : p
      )
    }));
  };

  const handleBackToPages = () => {
    setState(prev => ({
      ...prev,
      currentPage: null
    }));
  };

  if (state.currentPage) {
    return (
      <InlinePageEditor
        page={state.currentPage}
        onSave={handleSavePage}
        onBack={handleBackToPages}
      />
    );
  }

  return (
    <CMSLayout
      currentView={currentView}
      onNavigate={setCurrentView}
    >
      {currentView === 'pages' && (
        <PagesList
          pages={state.pages}
          onEdit={handleEditPage}
          onCreate={handleCreatePage}
          onDelete={handleDeletePage}
          onTogglePublish={handleTogglePublish}
        />
      )}
      {currentView === 'users' && (
        <div className="p-6">
          <h2 className="text-2xl font-bold text-foreground mb-4">Users</h2>
          <p className="text-muted-foreground">User management coming soon...</p>
        </div>
      )}
      {currentView === 'settings' && (
        <div className="p-6">
          <h2 className="text-2xl font-bold text-foreground mb-4">Settings</h2>
          <p className="text-muted-foreground">Settings panel coming soon...</p>
        </div>
      )}
    </CMSLayout>
  );
}