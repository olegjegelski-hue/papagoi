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
  images: {
    // Kui kasutad `output=export`, Next.js ei saa pilte serveris optimeerida.
    // Muul juhul lülitame optimeerimise sisse.
    unoptimized:
      process.env.NEXT_IMAGE_UNOPTIMIZED === 'true' ||
      process.env.NEXT_OUTPUT_MODE === 'export',
    remotePatterns: [
      // Notion ja S3 (erinevad regioonid) – papagoi.ee pilte vajatakse productionis
      { protocol: 'https', hostname: 'prod-files-secure.s3.us-west-2.amazonaws.com', pathname: '/**' },
      { protocol: 'https', hostname: 'prod-files-secure.s3.eu-west-1.amazonaws.com', pathname: '/**' },
      { protocol: 'https', hostname: 'prod-files-secure.s3.amazonaws.com', pathname: '/**' },
      { protocol: 'https', hostname: 'secure.notion-static.com', pathname: '/**' },
      { protocol: 'https', hostname: 's3.us-west-2.amazonaws.com', pathname: '/**' },
      { protocol: 'https', hostname: 's3.eu-west-1.amazonaws.com', pathname: '/**' },
      { protocol: 'https', hostname: '*.amazonaws.com', pathname: '/**' },
      // Fallback ja muu sisu
      { protocol: 'https', hostname: 'cdn.abacus.ai', pathname: '/**' },
      { protocol: 'https', hostname: 'images.pexels.com', pathname: '/**' },
      { protocol: 'https', hostname: 'upload.wikimedia.org', pathname: '/**' },
      { protocol: 'https', hostname: 'live.staticflickr.com', pathname: '/**' },
      { protocol: 'https', hostname: 'staticflickr.com', pathname: '/**' },
      { protocol: 'https', hostname: 'i.pinimg.com', pathname: '/**' },
      { protocol: 'https', hostname: 'images.unsplash.com', pathname: '/**' },
      { protocol: 'https', hostname: 'www.thesprucepets.com', pathname: '/**' },
      { protocol: 'https', hostname: 'static.vecteezy.com', pathname: '/**' },
      // Igasugune https pilt (Notion/S3 domeenid võivad muutuda) – papagoi.ee jaoks
      { protocol: 'https', hostname: '**', pathname: '/**' },
    ],
  },
};

module.exports = withNextIntl(nextConfig);
