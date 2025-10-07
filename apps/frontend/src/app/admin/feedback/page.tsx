import { Metadata } from 'next';
import { MessageSquare, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { FeedbackAdminDashboard } from '@/components/admin/feedback-admin-dashboard';

export const metadata: Metadata = {
  title: 'Feedback Admin | Remco Stoeten',
  description: 'View and manage all blog post feedback and reactions.',
  robots: 'noindex, nofollow',
};

export default function FeedbackAdminPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </div>
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-accent/10 border border-border/50">
              <MessageSquare className="h-8 w-8 text-accent" />
            </div>
            <div>
              <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Feedback Dashboard
              </h1>
            </div>
          </div>
          <p className="text-muted-foreground text-lg max-w-2xl">
            View all feedback and reactions from your blog posts.
          </p>
        </div>

        <FeedbackAdminDashboard />
      </div>
    </div>
  );
}
