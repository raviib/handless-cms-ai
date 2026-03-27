/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  allowedDevOrigins: ['192.168.0.217', "66.116.205.123",'virgo-cms.ibees.in', 'virgo.ibees.in'],
  experimental: {
    proxyClientMaxBodySize: '50mb',
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '192.168.0.217',
        port: '3044',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: '66.116.205.123',
        port: '3044',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'virgo-cms.ibees.in',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'virgo.ibees.in',
        pathname: '/**',
      },
    ],
  },
  compress: true,
};

export default nextConfig;
