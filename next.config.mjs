/** @type {import('next').NextConfig} */
const nextConfig = {
    outputFileTracingRoot: process.cwd(),
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'avatars.githubusercontent.com',
                port: '',
                pathname: '**',
            },
            {
                protocol: 'https',
                hostname: 'i.scdn.co',
                port: '',
                pathname: '**',
            },
        ],
    },
    async redirects() {
        return [
            {
                source: '/categories',
                destination: '/blog/categories',
                permanent: true,
            },
            {
                source: '/categories/:slug*',
                destination: '/blog/categories/:slug*',
                permanent: true,
            },
            {
                source: '/topics',
                destination: '/blog/topics',
                permanent: true,
            },
            {
                source: '/topics/:slug*',
                destination: '/blog/topics/:slug*',
                permanent: true,
            },
        ]
    },
}

export default nextConfig
