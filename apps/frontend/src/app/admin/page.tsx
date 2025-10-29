import { Metadata } from 'next';
import { Shield, MessageSquare, MessageSquareText, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Admin Dashboard | Remco Stoeten',
  description: 'Administrative dashboard for managing your website.',
  robots: 'noindex, nofollow',
};

export default function AdminPage() {
  const adminSections = [
    {
      title: 'Contact Messages',
      description: 'Manage contact form submissions',
      href: '/admin/messages',
      icon: MessageSquareText,
      color: 'text-green-500',
    },
    {
      title: 'Feedback Management',
      description: 'View and manage blog post feedback',
      href: '/admin/feedback',
      icon: MessageSquare,
      color: 'text-purple-500',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 max-w-6xl">
        {/* Back Navigation */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </div>

        {/* Header Section */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent/10 border border-border/50 mb-6">
              <Shield className="h-8 w-8 text-accent" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto">
              Manage your website's content, analytics, and user interactions.
            </p>
          </div>
        </div>

        {/* Admin Cards Grid */}
        <div className="mb-12">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {adminSections.map((section) => {
              const Icon = section.icon;
              return (
                <Link
                  key={section.href}
                  href={section.href}
                  className="group relative bg-card border border-border rounded-xl p-6 hover:border-accent/50 transition-all duration-300 hover:shadow-lg hover:shadow-accent/5 hover:-translate-y-1"
                >
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className={`p-3 rounded-xl bg-accent/10 group-hover:bg-accent/20 transition-colors`}>
                      <Icon className={`h-6 w-6 ${section.color}`} />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold group-hover:text-accent transition-colors">
                        {section.title}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {section.description}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-16">
          <div className="bg-muted/30 rounded-xl border border-border/50 p-6">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-lg bg-accent/10">
                <Shield className="h-5 w-5 text-accent" />
              </div>
              <div className="flex-1">
                <h2 className="text-base font-semibold mb-2">Security Notice</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  This area is restricted to authorized personnel only. All actions are logged and monitored.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}