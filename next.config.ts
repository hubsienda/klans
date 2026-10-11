import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'klans.naralimon.com',
          },
        ],
        destination: 'https://klanz.naralimon.com/:path*',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
