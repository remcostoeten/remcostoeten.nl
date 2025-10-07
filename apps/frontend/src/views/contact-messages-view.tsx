'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { AdminAuth } from '@/components/admin-auth';

type TContactMessage = {
  id: number;
  name: string;
  contact: string;
  message: string;
  read: string | null;
  createdAt: string;
};

type TMessagesData = {
  messages: TContactMessage[];
  unreadCount: number;
  total: number;
};

export function ContactMessagesView() {
  const [data, setData] = useState<TMessagesData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  async function fetchMessages() {
    setIsLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001';
      const queryParams = filter === 'unread' ? '?unreadOnly=true' : '';
      const response = await fetch(`${apiUrl}/api/contact${queryParams}`);
      
      if (response.ok) {
        const result = await response.json();
        setData(result.data);
      } else {
        toast.error('Failed to fetch messages');
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to fetch messages');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleMarkAsRead(id: number) {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001';
      const response = await fetch(`${apiUrl}/api/contact/${id}/read`, {
        method: 'PATCH',
      });

      if (response.ok) {
        toast.success('Marked as read');
        fetchMessages();
      } else {
        toast.error('Failed to mark as read');
      }
    } catch (error) {
      console.error('Error marking as read:', error);
      toast.error('Failed to mark as read');
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Are you sure you want to delete this message?')) {
      return;
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001';
      const response = await fetch(`${apiUrl}/api/contact/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Message deleted');
        fetchMessages();
      } else {
        toast.error('Failed to delete message');
      }
    } catch (error) {
      console.error('Error deleting message:', error);
      toast.error('Failed to delete message');
    }
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  }

  useEffect(() => {
    fetchMessages();
  }, [filter]);

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-8">Contact Messages</h1>
        <p className="text-muted-foreground">Loading messages...</p>
      </div>
    );
  }

  return (
    <AdminAuth>
      <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Contact Messages</h1>
          {data && (
            <p className="text-muted-foreground mt-2">
              {data.total} total messages · {data.unreadCount} unread
            </p>
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              filter === 'all'
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              filter === 'unread'
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }`}
          >
            Unread ({data?.unreadCount || 0})
          </button>
        </div>
      </div>

      {data && data.messages.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-border rounded-lg">
          <p className="text-muted-foreground">No messages found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {data?.messages.map((message) => (
            <div
              key={message.id}
              className={`border border-border rounded-lg p-6 transition-colors ${
                !message.read ? 'bg-accent/5' : 'bg-card'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-lg">{message.name}</h3>
                    {!message.read && (
                      <span className="px-2 py-0.5 bg-accent text-accent-foreground text-xs rounded-full">
                        New
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">
                    {message.contact}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(message.createdAt)}
                  </p>
                </div>

                <div className="flex gap-2">
                  {!message.read && (
                    <button
                      onClick={() => handleMarkAsRead(message.id)}
                      className="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                    >
                      Mark read
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(message.id)}
                    className="px-3 py-1.5 text-sm bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>

              <div className="mt-4 p-4 bg-muted/50 rounded-md">
                <p className="text-sm whitespace-pre-wrap">{message.message}</p>
              </div>
            </div>
          ))}
        </div>
      )}
      </div>
    </AdminAuth>
  );
}
