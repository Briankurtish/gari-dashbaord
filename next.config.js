/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ["api.gari-mobility.tech", "storage.googleapis.com"],
  },
};

module.exports = nextConfig;
