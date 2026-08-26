const path = require('path');
const createNextIntlPlugin = require('next-intl/plugin');

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production';

const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  experimental: {
    // Playwright / Chromium ei tohi Webpacki sisse minna (Vercel serverless)
    serverComponentsExternalPackages: [
      'playwright',
      'playwright-core',
      '@sparticuz/chromium-min',
    ],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      const externals = ['@sparticuz/chromium-min', 'playwright-core', 'playwright']
      if (Array.isArray(config.externals)) {
        config.externals.push(...externals)
      }
    }
    return config
  },
  images: {
    // Kui kasutad `output=export`, Next.js ei saa pilte serveris optimeerida.
    // Muul juhul lülitame optimeerimise sisse.
    unoptimized:
      process.env.NEXT_IMAGE_UNOPTIMIZED === 'true' ||
      process.env.NEXT_OUTPUT_MODE === 'export',
    remotePatterns: [
      // next/image kaughostid (inventuur 26.08.2026). hostname '**' ja '*.amazonaws.com' eemaldatud.
      // Avaleht / navi / grupid / külastajatele:
      { protocol: 'https', hostname: 'cdn.abacus.ai', pathname: '/**' },
      // Notion failid (papagoid + blogi API, 26.08: kõik us-west-2). Lehed kasutavad <img>, mitte next/image;
      // jätame optimeerija jaoks, kui mõni Image selle URL-i saab. Teised piirkonnad: Notion on varem vahetanud.
      { protocol: 'https', hostname: 'prod-files-secure.s3.us-west-2.amazonaws.com', pathname: '/**' },
      { protocol: 'https', hostname: 'prod-files-secure.s3.eu-west-1.amazonaws.com', pathname: '/**' },
      { protocol: 'https', hostname: 'prod-files-secure.s3.amazonaws.com', pathname: '/**' },
      { protocol: 'https', hostname: 'secure.notion-static.com', pathname: '/**' },
      // lib/parrots.ts + parrot-gallery / parrot-preview / parrot-categories (next/image)
      { protocol: 'https', hostname: 'images.pexels.com', pathname: '/**' },
      { protocol: 'https', hostname: 'upload.wikimedia.org', pathname: '/**' },
      { protocol: 'https', hostname: 'static.vecteezy.com', pathname: '/**' },
      { protocol: 'https', hostname: 'i.pinimg.com', pathname: '/**' },
      { protocol: 'https', hostname: 'live.staticflickr.com', pathname: '/**' },
      // papagoid fallback-andmed (praegu <img>; host jääb, et Image ei katkeks)
      { protocol: 'https', hostname: 'www.thesprucepets.com', pathname: '/**' },
    ],
  },
};

module.exports = withNextIntl(nextConfig);
