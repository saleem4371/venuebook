/**
 * /next.config.js
 *
 * Next.js configuration with next-intl plugin.
 * The plugin wires up /i18n/request.js so that:
 *   - getTranslations() works in server components
 *   - getMessages() works in server layouts
 *   - NextIntlClientProvider receives messages automatically
 */

const createNextIntlPlugin = require("next-intl/plugin");

const withNextIntl = createNextIntlPlugin("./i18n/request.js");

/** @type {import('next').NextConfig} */
const nextConfig = {
  /* Images from external domains can be added here as needed */
  images: {
    remotePatterns: [],
  },
};

module.exports = withNextIntl(nextConfig);
