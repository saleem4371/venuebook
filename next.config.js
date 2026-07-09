const createNextIntlPlugin = require("next-intl/plugin");
const withNextIntl = createNextIntlPlugin("./i18n/request.js");

const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
});

/** @type {import('next').NextConfig} */
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
  // "Wishlist" was renamed to "My Collections" — /wishlist moved to
  // /collections. This catches old bookmarks/links at the routing layer
  // (before the thin redirect stub left at wishlist/page.jsx even renders).
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