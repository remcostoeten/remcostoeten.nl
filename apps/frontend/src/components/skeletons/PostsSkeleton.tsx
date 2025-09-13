export function PostsSkeleton() {
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
                <div className="w-16 h-6 bg-stone-800 rounded mx-1 animate-pulse"></div>
                <div className="w-14 h-6 bg-stone-700 rounded mx-1 animate-pulse"></div>
              </nav>
            </div>
            <div className="w-20 h-8 bg-stone-700 rounded animate-pulse"></div>
          </div>
        </nav>
      </div>

      <main className="pt-24 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header Skeleton */}
          <div className="mb-12">
            <div className="mb-8">
              <div className="w-16 h-8 bg-stone-700 rounded mb-2 animate-pulse"></div>
            </div>
            
            {/* Categories Skeleton */}
            <div className="flex flex-wrap gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-20 h-8 bg-stone-700 rounded-lg animate-pulse"></div>
              ))}
            </div>
          </div>

          {/* Posts List Skeleton */}
          <section className="py-12 pb-16 max-w-[680px] w-full">
            <div className="flex flex-col gap-0">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="border-b border-stone-700/30" style={{ minHeight: '90px' }}>
                  <div className="flex items-center justify-between py-[45px]">
                    <div className="flex-1 flex flex-col gap-[2px]">
                      <div className="w-3/4 h-4 bg-stone-700 rounded mb-1 animate-pulse"></div>
                      <div className="w-full h-4 bg-stone-700 rounded animate-pulse"></div>
                    </div>
                    <div className="w-16 h-4 bg-stone-700 rounded animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}