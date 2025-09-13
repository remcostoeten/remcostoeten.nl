import { Navigation } from '@/components/navigation';
import { ProfileSection } from '@/components/profile-section';
import { FeaturedPosts } from '@/components/featured-posts';
import { NewPosts } from '@/components/new-posts';
import { Newsletter } from '@/components/newsletter';
import { PageTracker } from '@/components/analytics';
import { blogPosts } from '@/lib/blog-data';

export default function HomePage() {
  return (
    <div className="min-h-screen" style={{ background: '#171616' }}>
      <PageTracker customTitle="Home - Blog" />
      <Navigation navigationItems={[
        { label: 'Home', href: '/', isActive: true },
        { label: 'All posts', href: '/posts', isActive: false },
        { label: 'Analytics', href: '/analytics', isActive: false },
        { label: 'Contact', href: '/contact', isActive: false },
      ]} />
      
      <main className="pt-24 px-4">
        <div className="max-w-4xl mx-auto">
          <ProfileSection />
          <FeaturedPosts />
          <NewPosts posts={blogPosts} />
          <Newsletter />
          
          {/* Beyond the Blog Section */}
          <section className="py-16">
            <h2 className="text-3xl font-semibold text-white mb-6" style={{ fontSize: '24px', lineHeight: '1.2' }}>Beyond the Blog</h2>
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
              . Whether it's design, tech, or creative experiments, there\'s always something exciting to share.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}