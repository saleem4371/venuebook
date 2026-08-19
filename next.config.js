const createNextIntlPlugin = require("next-intl/plugin");
const withNextIntl = createNextIntlPlugin("./i18n/request.js");

const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
});

const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "ui-avatars.com",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/:locale/:country/wishlist",
        destination: "/:locale/:country/collections",
        permanent: true,
      },
      {
        source: "/:locale/:country/wishlist/:path*",
        destination: "/:locale/:country/collections/:path*",
        permanent: true,
      },
    ];
  },
};

module.exports = withNextIntl(withPWA(nextConfig));