/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/lp',
        destination: '/lp.html',
      },
    ];
  },
};

export default nextConfig;
