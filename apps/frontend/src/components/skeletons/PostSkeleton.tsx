export function PostSkeleton() {
  return (
    <div className="min-h-screen" style={{ background: '#171616' }}>
      {/* Navigation Skeleton */}
      <div className="fixed top-0 left-1/2 transform -translate-x-1/2 w-full z-50">
        <nav className="flex items-center justify-center overflow-hidden">
          <div className="flex items-center justify-between flex-1 px-6 py-5 backdrop-blur-sm"
               style={{ background: 'linear-gradient(to bottom, rgba(23, 22, 22, 1) 0%, rgba(23, 22, 22, 0.8) 50%, transparent 100%)' }}>
            <div className="flex items-center flex-1 gap-3 pr-3">
              <div className="flex items-center flex-1 gap-2.5">
                <div className="w-8 h-8 bg-stone-700 rounded-full animate-pulse"></div>
                <div className="w-20 h-4 bg-stone-700 rounded animate-pulse"></div>
              </div>
              <nav className="flex items-center gap-0">
                <div className="w-12 h-6 bg-stone-700 rounded mx-1 animate-pulse"></div>
                <div className="w-16 h-6 bg-stone-700 rounded mx-1 animate-pulse"></div>
                <div className="w-14 h-6 bg-stone-700 rounded mx-1 animate-pulse"></div>
              </nav>
            </div>
            <div className="w-20 h-8 bg-stone-700 rounded animate-pulse"></div>
          </div>
        </nav>
      </div>

      <main className="pt-24 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            {/* Back Button Skeleton */}
            <div className="w-20 h-8 bg-stone-700 rounded-lg mb-6 animate-pulse"></div>
            
            {/* Date Skeleton */}
            <div className="mb-4">
              <div className="w-24 h-4 bg-stone-700 rounded animate-pulse"></div>
            </div>
            
            {/* Title Skeleton */}
            <div className="w-3/4 h-10 bg-stone-700 rounded mb-4 animate-pulse"></div>
            
            {/* Description Skeleton */}
            <div className="w-full h-4 bg-stone-700 rounded mb-2 animate-pulse"></div>
            <div className="w-2/3 h-4 bg-stone-700 rounded mb-4 animate-pulse"></div>

            {/* View Counter Skeleton */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 bg-stone-700 rounded animate-pulse"></div>
                <div className="w-8 h-4 bg-stone-700 rounded animate-pulse"></div>
                <div className="w-20 h-4 bg-stone-700 rounded animate-pulse"></div>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 bg-stone-700 rounded animate-pulse"></div>
                <div className="w-8 h-4 bg-stone-700 rounded animate-pulse"></div>
                <div className="w-24 h-4 bg-stone-700 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
          
          {/* Article Content Skeleton */}
          <article className="prose prose-invert prose-lg max-w-none">
            <div className="bg-stone-700/30 rounded-lg p-8 border border-stone-600/50">
              <div className="w-full h-4 bg-stone-700 rounded mb-6 animate-pulse"></div>
              <div className="w-full h-4 bg-stone-700 rounded mb-2 animate-pulse"></div>
              <div className="w-3/4 h-4 bg-stone-700 rounded mb-6 animate-pulse"></div>
              
              <div className="w-full h-4 bg-stone-700 rounded mb-2 animate-pulse"></div>
              <div className="w-full h-4 bg-stone-700 rounded mb-2 animate-pulse"></div>
              <div className="w-2/3 h-4 bg-stone-700 rounded mb-6 animate-pulse"></div>
              
              <div className="w-full h-4 bg-stone-700 rounded mb-2 animate-pulse"></div>
              <div className="w-4/5 h-4 bg-stone-700 rounded animate-pulse"></div>
            </div>
          </article>
        </div>
      </main>
    </div>
  );
}