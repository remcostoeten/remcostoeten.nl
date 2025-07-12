import React, { ReactNode } from 'react';
import { Settings, Users, FileText, LogOut } from 'lucide-react';

interface CMSLayoutProps {
  children: ReactNode;
  currentView: string;
  onNavigate: (view: string) => void;
}

export default function CMSLayout({ children, currentView, onNavigate }: CMSLayoutProps) {
  const navigation = [
    { id: 'pages', label: 'Pages', icon: FileText },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <div className="w-64 bg-card shadow-sm border-r border-border">
        <div className="p-6">
          <h1 className="text-xl font-bold text-foreground">CMS Dashboard</h1>
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
        </nav>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {children}
      </div>
    </div>
  );
}