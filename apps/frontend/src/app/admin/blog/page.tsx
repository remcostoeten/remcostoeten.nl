// Force dynamic rendering for admin pages
export const dynamic = 'force-dynamic';

export default function BlogAdminPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Blog Admin</h1>
        <p className="text-muted-foreground">
          Admin panel under development. Check back later.
        </p>
      </div>
      
      <div className="p-6 border border-border rounded-lg bg-muted/20">
        <h2 className="text-xl font-semibold mb-4">Coming Soon</h2>
        <p className="text-muted-foreground">
          Blog management features are currently being developed. This will include:
        </p>
        <ul className="list-disc list-inside mt-4 space-y-2 text-muted-foreground">
          <li>Blog post analytics</li>
          <li>Content management</li>
          <li>Publishing controls</li>
        </ul>
      </div>
    </div>
  );
}
