import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
	outputFileTracingRoot: process.cwd(),
	images: {
		remotePatterns: [
			{
				protocol: 'https',
				hostname: 'avatars.githubusercontent.com',
				port: '',
				pathname: '**'
			},
			{
				protocol: 'https',
				hostname: 'i.scdn.co',
				port: '',
				pathname: '**'
			},
			{
				protocol: 'https',
				hostname: 'lh3.googleusercontent.com',
				port: '',
				pathname: '**'
			}
		],
		formats: ['image/webp', 'image/avif'],
		minimumCacheTTL: 86400,
		deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
		imageSizes: [16, 32, 48, 64, 96, 128, 256, 384]
	},
	async redirects() {
		return [
			{
				source: '/categories',
				destination: '/blog/topics',
				permanent: true
			},
			{
				source: '/categories/:slug*',
				destination: '/blog/topics/:slug*',
				permanent: true
			},
			{
				source: '/topics',
				destination: '/blog/topics',
				permanent: true
			},
			{
				source: '/topics/:slug*',
				destination: '/blog/topics/:slug*',
				permanent: true
			}
		]
	},
	compress: true,
	productionBrowserSourceMaps: false,
	experimental: {
		optimizePackageImports: [
			'lucide-react',
			'react-icons',
			'@radix-ui/react-collapsible',
			'@radix-ui/react-scroll-area',
			'@radix-ui/react-separator',
			'@radix-ui/react-slot',
			'@radix-ui/react-tabs',
			'@radix-ui/react-switch',
			'framer-motion',
			'react-markdown',
			'react-syntax-highlighter',
			'posthog-js',
			'better-auth'
		]
	},
	typescript: {
		ignoreBuildErrors: process.env.FAST_BUILD === 'true'
	}
}

export default nextConfig
