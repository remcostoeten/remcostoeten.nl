import { Suspense, memo } from 'react';
import dynamic from 'next/dynamic';
import { Navigation } from '@/components/navigation';
import { ProfileSection } from '@/components/profile-section';
import { blogPosts } from '@/lib/blog-data';

// Dynamic imports for non-critical components
const FeaturedPosts = dynamic(() => import('@/components/featured-posts').then(mod => ({ default: mod.FeaturedPosts })), {
  ssr: true,
  loading: () => <div className="h-32 bg-stone-800/20 rounded-lg animate-pulse" />
});

const NewPosts = dynamic(() => import('@/components/new-posts').then(mod => ({ default: mod.NewPosts })), {
  ssr: true,
  loading: () => <div className="h-64 bg-stone-800/20 rounded-lg animate-pulse" />
});

const Newsletter = dynamic(() => import('@/components/newsletter').then(mod => ({ default: mod.Newsletter })), {
  ssr: false, // Load after initial render
  loading: () => <div className="h-24 bg-stone-800/20 rounded-lg animate-pulse" />
});

// Memoized Beyond the Blog section
const BeyondTheBlog = memo(() => (
  <section className="py-16">
    <h2 className="text-3xl font-semibold text-white mb-6" style={{ fontSize: '24px', lineHeight: '1.2' }}>
      Beyond the Blog
    </h2>
    <p className="leading-relaxed" style={{ fontSize: '16px', color: '#aba9a7', lineHeight: '1.7' }}>
      Looking for more? Explore my{' '}
      <a 
        href="https://framer.com" 
        target="_blank" 
        rel="noopener noreferrer"
        className="underline decoration-transparent hover:decoration-current transition-all duration-300"
      >
        portfolio
      </a>
      ,{' '}
      <a 
        href="https://producthunt.com" 
        target="_blank" 
        rel="noopener noreferrer"
        className="underline decoration-transparent hover:decoration-current transition-all duration-300"
      >
        past collaborations
      </a>
      , and{' '}
      <a 
        href="https://linkedin.com" 
        target="_blank" 
        rel="noopener noreferrer"
        className="underline decoration-transparent hover:decoration-current transition-all duration-300"
      >
        side projects
      </a>
      . Whether it's design, tech, or creative experiments, there's always something exciting to share.
    </p>
  </section>
));

BeyondTheBlog.displayName = 'BeyondTheBlog';

export default function HomePage() {
  return (
    <div className="min-h-screen" style={{ background: '#171616' }}>
      <Navigation />
      
      <main className="pt-24 px-4">
        <div className="max-w-4xl mx-auto">
          <ProfileSection />
          
          <Suspense fallback={<div className="h-32 bg-stone-800/20 rounded-lg animate-pulse" />}>
            <FeaturedPosts />
          </Suspense>
          
          <Suspense fallback={<div className="h-64 bg-stone-800/20 rounded-lg animate-pulse" />}>
            <NewPosts posts={blogPosts} />
          </Suspense>
          
          <Suspense fallback={<div className="h-24 bg-stone-800/20 rounded-lg animate-pulse" />}>
            <Newsletter />
          </Suspense>
          
          <BeyondTheBlog />
        </div>
      </main>
    </div>
  );
}