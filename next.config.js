/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ["images.supresa.workers.dev", "replicate.delivery"],
  },
  async redirects() {
    return [
      {
        source: "/launch",
        destination: "https://twitter.com/steventey/status/1616505632001232896",
        permanent: false,
      },
      {
        source: "/github",
        destination: "https://github.com/Devazc/Supresa.app",
        permanent: false,
      },
      {
        source: "/deploy",
        destination: "https://vercel.com/templates/next.js/extrapolate",
        permanent: false,
      },
      {
        source: "/p",
        destination: "/",
        permanent: false,
      },
    ];
  },
};

module.exports = nextConfig;
