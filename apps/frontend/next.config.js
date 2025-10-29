const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 31536000, // 1 year
  },
  compress: true,
  poweredByHeader: false,
  generateEtags: false,
  output: 'standalone',
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'md', 'mdx'],
};

const createMDXPlugin = async () => {
  const { default: remarkGfm } = await import('remark-gfm');
  const { default: rehypeHighlight } = await import('rehype-highlight');
  const { rehypeCodeHeight } = await import('./src/lib/mdx/rehype-code-height.mjs');

  return require('@next/mdx')({
    extension: /\.mdx?$/,
    options: {
      remarkPlugins: [[remarkGfm, { table: true }]],
      rehypePlugins: [rehypeHighlight, rehypeCodeHeight],
    },
  });
};

module.exports = async () => {
  const withMDX = await createMDXPlugin();
  return withMDX(nextConfig);
};
