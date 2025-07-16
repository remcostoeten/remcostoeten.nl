import { resolve } from "path";
import { fileURLToPath } from "url";

const withBundleAnalyzer = process.env.ANALYZE === "true" ? 
	require("@next/bundle-analyzer")({ enabled: true }) : 
	(config) => config;

const __dirname = fileURLToPath(new URL(".", import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
	// Enable experimental features for better performance
	experimental: {
		// Enable optimized package imports
		optimizePackageImports: ["lucide-react", "framer-motion"],
		// Enable turbo mode for faster builds
		turbo: {
			rules: {
				"*.svg": {
					loaders: ["@svgr/webpack"],
					as: "*.js",
				},
			},
		},
	},

	// Compiler optimizations
	compiler: {
		// Remove console logs in production
		removeConsole: process.env.NODE_ENV === "production",
	},

	// Image optimization
	images: {
		formats: ["image/avif", "image/webp"],
		minimumCacheTTL: 31536000, // 1 year
		dangerouslyAllowSVG: true,
		contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
		unoptimized: true, // Added update
	},

	// Performance optimizations
	poweredByHeader: false,
	compress: true,

	// Bundle optimization
	webpack: (config, { dev, isServer }) => {
		// Optimize bundle splitting
		if (!dev && !isServer) {
			config.optimization.splitChunks = {
				chunks: "all",
				cacheGroups: {
					vendor: {
						test: /[\\/]node_modules[\\/]/,
						name: "vendors",
						priority: 10,
						reuseExistingChunk: true,
					},
					common: {
						name: "common",
						minChunks: 2,
						priority: 5,
						reuseExistingChunk: true,
					},
				},
			};
		}

		// Optimize imports
		config.resolve.alias = {
			...config.resolve.alias,
			"@": resolve(__dirname, "./src"),
		};

		return config;
	},

	// Headers for better caching and security
	async headers() {
		return [
			{
				source: "/(.*)",
				headers: [
					{
						key: "X-Content-Type-Options",
						value: "nosniff",
					},
					{
						key: "X-Frame-Options",
						value: "DENY",
					},
					{
						key: "X-XSS-Protection",
						value: "1; mode=block",
					},
				],
			},
			{
				source: "/favicon.ico",
				headers: [
					{
						key: "Cache-Control",
						value: "public, max-age=31536000, immutable",
					},
				],
			},
		];
	},

	// Build validation
	eslint: {
		ignoreDuringBuilds: false,
	},
	typescript: {
		ignoreBuildErrors: false,
	},
};

export default withBundleAnalyzer(nextConfig);
