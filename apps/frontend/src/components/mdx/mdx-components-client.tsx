import dynamic from 'next/dynamic';

const AnimatedNumberDemo = dynamic(() => import('@/components/blog/animated-number-demo').then(mod => ({ default: mod.AnimatedNumberDemo })), {
  ssr: false,
  loading: () => <div className="w-full max-w-4xl mx-auto p-6 animate-pulse bg-muted rounded-lg" style={{ height: '400px' }} />
});

export { AnimatedNumberDemo };