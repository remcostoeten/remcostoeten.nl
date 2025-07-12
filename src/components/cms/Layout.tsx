import React, { ReactNode } from 'react';
import { FileText, Home, ExternalLink } from 'lucide-react';

interface CMSLayoutProps {
  children: ReactNode;
  currentView: string;
  onNavigate: (view: string) => void;
}

export default function CMSLayout({ children, currentView, onNavigate }: CMSLayoutProps) {
  const navigation = [
    { id: 'pages', label: 'Pages', icon: FileText },
  ];
  
  const handleGoHome = () => {
    window.open('/', '_blank');
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <div className="w-64 bg-card shadow-sm border-r border-border">
        <div className="p-6">
          <h1 className="text-xl font-bold text-foreground">Content Manager</h1>
          <p className="text-sm text-muted-foreground mt-1">Edit your site content</p>
        </div>
        
        <nav className="mt-6">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center px-6 py-3 text-left transition-colors ${
                  currentView === item.id
                    ? 'bg-accent/10 text-accent border-r-2 border-accent'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <Icon className="w-5 h-5 mr-3" />
                {item.label}
              </button>
            );
          })}
          
          <div className="border-t border-border mt-6 pt-6">
            <button
              onClick={handleGoHome}
              className="w-full flex items-center px-6 py-3 text-left transition-colors text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <Home className="w-5 h-5 mr-3" />
              View Site
              <ExternalLink className="w-3 h-3 ml-auto" />
            </button>
          </div>
        </nav>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {children}
      </div>
    </div>
  );
}